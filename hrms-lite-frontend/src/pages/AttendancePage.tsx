import React, { useEffect, useState } from 'react';
import { api, handleApiError } from '../lib/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Badge } from '../components/Badge';
import { CheckCircle2, XCircle, Users, BarChart3, Filter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isAfter, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

interface Employee {
    id: string;
    full_name: string;
    department?: string;
}

interface Attendance {
    id: string;
    employee_id: string;
    date: string;
    status: string;
    employee?: Employee;
}

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [formData, setFormData] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [markMessage, setMarkMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [filterDate, setFilterDate] = useState<string>('');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [empRes, attRes] = await Promise.all([
                api.get('/employees/'),
                api.get('/attendance/')
            ]);
            setEmployees(empRes.data);

            const attData = attRes.data.map((record: any) => ({
                ...record,
                employee: empRes.data.find((e: Employee) => e.id === record.employee_id)
            }));
            setAttendance(attData);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMarkMessage(null);

        try {
            const response = await api.post('/attendance/', formData);
            const newRecord = {
                ...response.data,
                employee: employees.find(e => e.id === response.data.employee_id)
            };
            setAttendance([newRecord, ...attendance]);
            setMarkMessage({ type: 'success', text: 'Attendance marked successfully!' });
        } catch (err) {
            setMarkMessage({ type: 'error', text: handleApiError(err) });
        } finally {
            setIsSubmitting(false);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Present').length;
    const absentToday = attendance.filter(a => a.date === todayStr && a.status === 'Absent').length;
    const totalEmployees = employees.length;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);
    const emptyDays = Array.from({ length: startDay });

    const monthRecords = attendance.filter(a => {
        const d = parseISO(a.date);
        return d >= monthStart && d <= monthEnd && a.status === 'Present';
    });

    const presenceCounts: Record<string, { count: number, names: string[] }> = {};
    monthRecords.forEach(r => {
        if (!presenceCounts[r.date]) presenceCounts[r.date] = { count: 0, names: [] };
        presenceCounts[r.date].count++;
        if (r.employee) presenceCounts[r.date].names.push(r.employee.full_name);
    });

    const getHeatmapColor = (dateStr: string, isToday: boolean, isFuture: boolean) => {
        const baseStyle = "border transition-all";

        if (isFuture) {
            return `${baseStyle} bg-gray-50 border-gray-100 text-gray-300`;
        }

        const data = presenceCounts[dateStr];

        if (!data || data.count === 0) {
            return isToday
                ? `${baseStyle} bg-white ring-2 ring-indigo-500 border-indigo-500 z-10 text-gray-900 font-bold`
                : `${baseStyle} bg-white border-gray-200 text-gray-500 hover:border-gray-300`;
        }

        const intensity = data.count / Math.max(totalEmployees, 1);

        let colorStyle = "";
        if (intensity <= 0.25) colorStyle = "bg-emerald-100 border-emerald-200 text-emerald-800";
        else if (intensity <= 0.50) colorStyle = "bg-emerald-300 border-emerald-400 text-emerald-900";
        else if (intensity <= 0.75) colorStyle = "bg-emerald-500 border-emerald-600 text-white";
        else colorStyle = "bg-emerald-700 border-emerald-800 text-white";

        return cn(
            baseStyle,
            colorStyle,
            isToday && "ring-2 ring-offset-1 ring-indigo-500 z-10"
        );
    };

    const filteredAttendance = filterDate
        ? attendance.filter(a => a.date === filterDate)
        : attendance;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Global view of workforce presence.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Employees"
                    value={totalEmployees}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    className="bg-blue-50/50 border-blue-100"
                />
                <StatsCard
                    title="Present Today"
                    value={presentToday}
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    className="bg-emerald-50/50 border-emerald-100"
                />
                <StatsCard
                    title="Absent Today"
                    value={absentToday}
                    icon={<XCircle className="w-5 h-5 text-red-600" />}
                    className="bg-red-50/50 border-red-100"
                />
                <StatsCard
                    title="Unmarked"
                    value={totalEmployees - presentToday - absentToday}
                    icon={<AlertCircle className="w-5 h-5 text-orange-600" />}
                    className="bg-orange-50/50 border-orange-100"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    <Card className="border-l-4 border-l-indigo-500 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/50 pb-3">
                            <CardTitle className="text-sm font-medium text-gray-700">Quick Action</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="w-full md:w-64">
                                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">Employee</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                        required
                                        value={formData.employee_id}
                                        onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full md:w-40">
                                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">Date</label>
                                    <Input
                                        type="date"
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="h-10 w-full"
                                    />
                                </div>
                                <div className="w-full md:w-auto">
                                    <div className="flex bg-gray-100 p-1 rounded-lg h-10 items-center">
                                        {['Present', 'Absent'].map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status })}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center h-full",
                                                    formData.status === status
                                                        ? (status === 'Present' ? "bg-white text-emerald-700 shadow-sm ring-1 ring-black/5" : "bg-white text-red-700 shadow-sm ring-1 ring-black/5")
                                                        : "text-gray-500 hover:text-gray-900"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} className="w-full md:w-auto h-10">
                                    Mark Status
                                </Button>
                            </form>
                            {markMessage && (
                                <div className={`mt-3 text-sm flex items-center gap-2 ${markMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {markMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {markMessage.text}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                                Attendance Heatmap
                            </CardTitle>
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium w-32 text-center text-gray-700 tabular-nums">
                                    {format(currentMonth, 'MMMM yyyy')}
                                </span>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="max-w-2xl mx-auto">
                                <div className="grid grid-cols-7 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                        <div key={i} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {emptyDays.map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}

                                    {daysInMonth.map((day) => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const isFuture = isAfter(day, new Date());
                                        const isToday = isSameDay(day, new Date());
                                        const data = presenceCounts[dateStr];
                                        const colorClass = getHeatmapColor(dateStr, isToday, isFuture);

                                        return (
                                            <div
                                                key={dateStr}
                                                className={cn(
                                                    "aspect-square rounded-lg flex flex-col items-center justify-center relative group cursor-default",
                                                    colorClass
                                                )}
                                            >
                                                <span className="text-sm">{format(day, 'd')}</span>

                                                {!isFuture && data && data.count > 0 && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none transition-opacity">
                                                        <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
                                                            <span className="font-semibold text-gray-300">Present</span>
                                                            <span className="font-bold">{data.count}</span>
                                                        </div>
                                                        <ul className="space-y-1 max-h-32 overflow-y-auto">
                                                            {data.names.map((n, i) => (
                                                                <li key={i} className="truncate flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                                                                    {n}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-50 border border-gray-100"></div>
                                    <span>Future</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
                                    <span>Empty</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></div>
                                    <span>Low</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600"></div>
                                    <span>High</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            Records
                            <Badge variant="neutral" className="text-xs font-normal text-gray-500 bg-gray-100">
                                {filteredAttendance.length}
                            </Badge>
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={e => setFilterDate(e.target.value)}
                                    className="text-xs border border-gray-200 rounded-md pl-7 pr-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>
                            {filterDate && (
                                <button onClick={() => setFilterDate('')} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <Card className="h-[calc(100vh-200px)] flex flex-col shadow-sm border-gray-200">
                        <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                    <p className="text-sm">Loading records...</p>
                                </div>
                            ) : filteredAttendance.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                    <div className="p-3 bg-gray-50 rounded-full">
                                        <Filter className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <p className="text-sm">No attendance records found.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="w-[90px] text-xs font-semibold">Date</TableHead>
                                            <TableHead className="text-xs font-semibold">Employee</TableHead>
                                            <TableHead className="text-right text-xs font-semibold">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAttendance.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-xs text-gray-500 py-3">
                                                    {format(parseISO(record.date), 'MMM dd')}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div className="font-medium text-sm text-gray-900">{record.employee?.full_name || 'Unknown'}</div>
                                                    <div className="text-[10px] text-gray-400">{record.employee?.department || 'General'}</div>
                                                </TableCell>
                                                <TableCell className="text-right py-3">
                                                    <Badge
                                                        variant={record.status === 'Present' ? 'success' : 'danger'}
                                                        className={cn(
                                                            "scale-90 px-2",
                                                            record.status === 'Present' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                                                        )}
                                                    >
                                                        {record.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, className }: { title: string, value: string | number, icon: React.ReactNode, className?: string }) {
    return (
        <Card className={cn("flex flex-col justify-between shadow-sm transition-all hover:shadow-md", className)}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className="p-2.5 bg-white/60 rounded-xl backdrop-blur-sm border border-white/50 shadow-sm">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}