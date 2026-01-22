import React, { useEffect, useState } from 'react';
import { Plus, Trash2, User, Mail } from 'lucide-react';
import { api, handleApiError } from '../lib/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';

interface Employee {
    id: string;
    full_name: string;
    email: string;
    department: string;
    created_at: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        department: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/employees/');
            setEmployees(response.data);
            setError(null);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee? This will also delete all their attendance records.')) return;

        try {
            await api.delete(`/employees/${id}`);
            setEmployees(employees.filter(e => e.id !== id));
        } catch (err) {
            alert(handleApiError(err));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            const response = await api.post('/employees/', formData);
            setEmployees([...employees, response.data]);
            setIsModalOpen(false);
            setFormData({ full_name: '', email: '', department: '' });
        } catch (err) {
            setFormError(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                    <p className="text-gray-500 mt-1">Manage your workforce here.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading employees...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : employees.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <User className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
                            <p className="text-gray-500 mt-1">Get started by adding your first employee.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {employee.full_name.charAt(0)}
                                            </div>
                                            <a href={`/employees/${employee.id}`} className="hover:underline hover:text-indigo-600 font-medium">
                                                {employee.full_name}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-gray-500">{employee.email}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {employee.department}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => window.location.href = `/employees/${employee.id}`}
                                                >
                                                    View Profile
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(employee.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle>Add New Employee</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {formError && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                        {formError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        placeholder="e.g. John Doe"
                                        required
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        icon={<User className="w-4 h-4" />}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="e.g. john@company.com"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        icon={<Mail className="w-4 h-4" />}
                                    />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Department</label>
                                        <select
                                            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="HR">HR</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Design">Design</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" isLoading={isSubmitting}>Save Employee</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
