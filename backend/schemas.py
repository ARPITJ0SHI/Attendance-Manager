from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from uuid import UUID
from typing import Optional, List

class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    date: date
    status: str

class AttendanceCreate(AttendanceBase):
    employee_id: UUID

class Attendance(AttendanceBase):
    id: UUID
    employee_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
