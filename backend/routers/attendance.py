from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .. import models, schemas, database
from uuid import UUID
from datetime import date

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"]
)

@router.get("/", response_model=list[schemas.Attendance])
def read_attendance(
    employee_id: UUID = None, 
    date: date = None,
    start_date: date = None,
    end_date: date = None,
    skip: int = 0, 
    limit: int = 1000,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Attendance)
    
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    
    if date:
        query = query.filter(models.Attendance.date == date)
        
    if start_date:
        query = query.filter(models.Attendance.date >= start_date)
        
    if end_date:
        query = query.filter(models.Attendance.date <= end_date)
    
    attendance_records = query.order_by(models.Attendance.date.desc()).offset(skip).limit(limit).all()
    return attendance_records

@router.post("/", response_model=schemas.Attendance, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(database.get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    from datetime import date
    if attendance.date > date.today():
        raise HTTPException(status_code=400, detail="Cannot mark attendance for future dates")

    new_attendance = models.Attendance(**attendance.dict())
    
    try:
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        return new_attendance
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Attendance already marked for this employee on this date")
