import { useState, useEffect } from 'react';
import { useRental } from '../../contexts/RentalContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RentalStatus } from '../../types';

type ViewMode = 'month' | 'week';

const RentalCalendar = () => {
  const { rentals } = useRental();
  const { equipment } = useEquipment();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayRentals, setDayRentals] = useState<any[]>([]);

  // Generate calendar days based on view mode
  const calendarDays = viewMode === 'month'
    ? eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      })
    : eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate)
      });

  // Get the day of the week (0-6) for the first day of the month
  // This is used to create the proper spacing in the calendar grid
  const startDay = getDay(calendarDays[0]);

  // Filter rentals for a specific day
  useEffect(() => {
    if (selectedDay) {
      const dayRentals = rentals.filter(rental => {
        const startDate = new Date(rental.startDate);
        const endDate = new Date(rental.endDate);
        
        return isWithinInterval(selectedDay, { start: startDate, end: endDate }) ||
               isSameDay(selectedDay, startDate) ||
               isSameDay(selectedDay, endDate);
      });
      
      // Sort by start date
      const sorted = [...dayRentals].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      setDayRentals(sorted);
    } else {
      setDayRentals([]);
    }
  }, [selectedDay, rentals]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
    setSelectedDay(null);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(isSameDay(day, selectedDay as Date) ? null : day);
  };

  const getEquipmentName = (id: string) => {
    const item = equipment.find(eq => eq.id === id);
    return item ? item.name : 'Unknown Equipment';
  };

  // Check if a day has rentals
  const dayHasRentals = (day: Date) => {
    return rentals.some(rental => {
      const startDate = new Date(rental.startDate);
      const endDate = new Date(rental.endDate);
      
      return isWithinInterval(day, { start: startDate, end: endDate }) ||
             isSameDay(day, startDate) ||
             isSameDay(day, endDate);
    });
  };

  const getStatusClass = (status: RentalStatus): string => {
    switch (status) {
      case RentalStatus.RESERVED:
        return 'bg-blue-100 text-blue-800';
      case RentalStatus.RENTED:
        return 'bg-green-100 text-green-800';
      case RentalStatus.RETURNED:
        return 'bg-gray-100 text-gray-800';
      case RentalStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case RentalStatus.OVERDUE:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {viewMode === 'month' 
                ? format(currentDate, 'MMMM yyyy')
                : `Week of ${format(calendarDays[0], 'MMM d')} - ${format(calendarDays[calendarDays.length - 1], 'MMM d, yyyy')}`}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-200 rounded-md overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
            </div>
            <div className="flex border border-gray-200 rounded-md overflow-hidden">
              <button 
                onClick={() => navigateMonth('prev')}
                className="p-2 bg-white hover:bg-gray-50 text-gray-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => navigateMonth('next')}
                className="p-2 bg-white hover:bg-gray-50 text-gray-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before the first of the month */}
            {viewMode === 'month' && Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24 p-1 rounded-md"></div>
            ))}
            
            {/* Actual calendar days */}
            {calendarDays.map(day => {
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const hasRentals = dayHasRentals(day);
              
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`h-24 p-1 rounded-md border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : isToday
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ${
                    isToday ? 'bg-orange-500 text-white' : ''
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  {hasRentals && (
                    <div className="mt-1">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mb-1"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Selected Day Rentals */}
      {selectedDay && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Rentals for {format(selectedDay, 'MMMM d, yyyy')}
          </h3>
          
          {dayRentals.length === 0 ? (
            <p className="text-gray-500">No rentals scheduled for this day.</p>
          ) : (
            <div className="space-y-4">
              {dayRentals.map(rental => (
                <div key={rental.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{getEquipmentName(rental.equipmentId)}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(rental.status)}`}>
                      {rental.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                  </div>
                  {rental.notes && (
                    <div className="text-sm text-gray-500 mt-2">{rental.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RentalCalendar;