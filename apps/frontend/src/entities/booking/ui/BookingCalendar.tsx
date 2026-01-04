"use client";

import { useState, useMemo } from "react";
import { BookingAvailabilityDto, BookingCalendarDto } from "@repo/dto";

interface BookingCalendarProps {
  propertyId?: string;
  availability?: BookingAvailabilityDto;
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
}

export function BookingCalendar({
  propertyId,
  availability,
  onDateSelect,
  onMonthChange,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarData = useMemo(() => {
    if (!availability?.calendar) {
      return {};
    }
    return Object.fromEntries(
      availability.calendar.map((item) => [
        new Date(item.date).toDateString(),
        item,
      ])
    );
  }, [availability]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getDayStatus = (date: Date): BookingCalendarDto | null => {
    return calendarData[date.toDateString()] || null;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-12" />;
          }

          const status = getDayStatus(date);
          const past = isPastDate(date);
          const today = isToday(date);
          const selected = isSelected(date);

          let bgClass = "hover:bg-slate-50";
          let textClass = "text-slate-900";
          let borderClass = today ? "border-2 border-orange-500" : "border border-transparent";

          if (past) {
            bgClass = "bg-slate-100 text-slate-400";
            textClass = "text-slate-400";
          } else if (status) {
            if (!status.available) {
              bgClass = "bg-red-50 hover:bg-red-100";
              textClass = "text-red-700";
              borderClass = "border border-red-200";
            } else if (status.price) {
              bgClass = "bg-green-50 hover:bg-green-100";
              textClass = "text-green-700";
              borderClass = "border border-green-200";
            }
          }

          if (selected) {
            bgClass = "bg-orange-500 hover:bg-orange-600";
            textClass = "text-white";
            borderClass = "border-2 border-orange-600";
          }

          return (
            <button
              key={index}
              onClick={() => !past && handleDateClick(date)}
              disabled={past}
              className={`h-12 rounded-lg ${bgClass} ${borderClass} ${textClass} text-sm font-medium transition-colors relative`}
              title={status ? (
                !status.available ? "Booked" : `Available - $${status.price}/night`
              ) : "Unknown"}
            >
              <span className="relative z-10">{date.getDate()}</span>
              {!past && status?.bookingId && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
          <span className="text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded" />
          <span className="text-slate-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-100 rounded" />
          <span className="text-slate-600">Past</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 rounded" />
          <span className="text-slate-600">Today</span>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {getDayStatus(selectedDate) && (
            <p className="text-xs text-slate-600 mt-1">
              {getDayStatus(selectedDate)?.available
                ? `Available - $${getDayStatus(selectedDate)?.price}/night`
                : "Not available"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
