import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, handleApiError } from '../lib/api';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isAfter } from 'date-fns';
import { cn } from '../lib/utils';
import { Badge } from '../components/Badge';

interface Employee {
    id: string;
    full_name: string;
    email: string;
    department: string;
}

interface Attendance {
    id: string;
    date: string;
    status: 'Present' | 'Absent';
}

export default function EmployeeDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const empRes = await api.get(`/employees/`);
                const found = empRes.data.find((e: Employee) => e.id === id);

                if (!found) {
                    setError('Employee not found');
                    return;
                }
                setEmployee(found);

                const attRes = await api.get(`/attendance/?employee_id=${id}`);
                setAttendance(attRes.data);
            } catch (err) {
                setError(handleApiError(err));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (error || !employee) return <div className="p-8 text-center text-red-500">{error || 'Employee not found'}</div>;

    const totalPresent = attendance.filter(a => a.status === 'Present').length;
    const totalAbsent = attendance.filter(a => a.status === 'Absent').length;
    const totalRecords = totalPresent + totalAbsent;
    const presenceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const startDay = getDay(monthStart);
    const emptyDays = Array.from({ length: startDay });

    const getStatusForDay = (date: Date) => {
        return attendance.find(a => isSameDay(new Date(a.date), date));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                            {employee.department}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{employee.email}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Present"
                    value={totalPresent}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                    className="bg-green-50/50 border-green-100"
                />
                <StatsCard
                    title="Total Absent"
                    value={totalAbsent}
                    icon={<XCircle className="w-5 h-5 text-red-600" />}
                    className="bg-red-50/50 border-red-100"
                />
                <StatsCard
                    title="Attendance Rate"
                    value={`${presenceRate}%`}
                    icon={<AlertCircle className="w-5 h-5 text-indigo-600" />}
                    className="bg-indigo-50/50 border-indigo-100"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 overflow-hidden border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50 bg-gray-50/30">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            Attendance Calendar
                        </CardTitle>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</Button>
                            <span className="text-sm font-medium w-32 text-center text-gray-700">
                                {format(currentMonth, 'MMMM yyyy')}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-7 text-center mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}

                            {daysInMonth.map((day) => {
                                const record = getStatusForDay(day);
                                const isFuture = isAfter(day, new Date());
                                const isToday = isSameDay(day, new Date());

                                let bgClass = "bg-gray-50 border-gray-100 text-gray-400";
                                if (record) {
                                    if (record.status === 'Present') bgClass = "bg-green-100 border-green-200 text-green-700 font-medium";
                                    if (record.status === 'Absent') bgClass = "bg-red-100 border-red-200 text-red-700 font-medium";
                                } else if (isToday) {
                                    bgClass = "ring-2 ring-indigo-500 ring-offset-2 border-gray-200 text-gray-900 font-semibold";
                                }

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={cn(
                                            "aspect-square rounded-lg border flex items-center justify-center text-sm transition-all hover:scale-105 cursor-default",
                                            bgClass,
                                            isFuture && "opacity-30 bg-white border-dashed text-gray-300 pointer-events-none"
                                        )}
                                        title={record ? `${format(day, 'MMM d')}: ${record.status}` : format(day, 'MMM d')}
                                    >
                                        {format(day, 'd')}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-4 mt-6 text-xs text-gray-500 justify-end">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div> Present</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div> Absent</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-50 border border-gray-200"></div> No Info</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {attendance.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No attendance records yet.</p>
                        ) : (
                            attendance.slice(0, 5).map(record => (
                                <div key={record.id} className="flex justify-between items-center text-sm pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                                    <span className="text-gray-600 font-medium font-mono">
                                        {format(new Date(record.date), 'MMM dd')}
                                    </span>
                                    <Badge variant={record.status === 'Present' ? 'success' : 'danger'} className="scale-90">
                                        {record.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, className }: { title: string, value: string | number, icon: React.ReactNode, className?: string }) {
    return (
        <Card className={cn("flex flex-col justify-between", className)}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-sm font-medium">{title}</span>
                    {icon}
                </div>
                <div className="text-3xl font-bold text-gray-800">{value}</div>
            </CardContent>
        </Card>
    );
}
