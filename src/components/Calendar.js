import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { CalendarContext } from '../context/CalendarContext';
import './Calendar.css';

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const formatDateDMY = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

//Calendar Body & Header
const Calendar = () => {
    const {currentDate, setCurrentDate} = useContext(CalendarContext);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const today = new Date();
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

//Data store in state and save in local storage
    const [eventData, setEventData] = useState([]);
    const [holidays, setHolidays] = useState({});

    useEffect(() => {
        const savedEvents = localStorage.getItem('eventData');
        if (savedEvents) {
            setEventData(JSON.parse(savedEvents));
        }
    }, []);

//Showing Holiday
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await fetch('/holiday.json');
                const data = await response.json();
                const map = {};
                data.forEach(h => map[h.date] = h.name);
                setHolidays(map);
            } 
            catch (error) {
                console.error('Failed to load local holidays:', error);
            }
        };
        fetchHolidays();
    }, []);

//Showing date in calender body
    const calendarCells = () => {
        const cells = [];
        for (let i = 0; i < startDay; i++) 
        {
            cells.push(<div key={`empty-${i}`} className='calendar-cell'></div>);
        }
        for (let d = 1; d <= totalDays; d++) 
        {
            const date = new Date(year, month, d);
            const dateStr = formatDate(date);
            const dayOfWeek = date.getDay(); // 0 = Sunday
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const isToday = date.toDateString() === localToday.toDateString(); 
            const holidayName = holidays[dateStr];    
            const eventsForDate = eventData.filter(ev => {
            const startStr = formatDate(new Date(ev.startDt));
            const endStr = formatDate(new Date(ev.endDt));
            return dateStr >= startStr && dateStr <= endStr;
        });

//Color change for Saturday & Sunday, highlighted current date, showing dot in event date and showing event numbers
        const hasEvents = eventsForDate.length > 0;
        const multipleEvents = eventsForDate.length > 1;

            cells.push(
                <div key={d} className={`calendar-cell day ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''} ${holidayName ? 'holiday' : ''}`}
                onClick={() => handleDateClick(dateStr)}>
                    <div className={isToday ? 'today' : ''}>{d}</div>
                    {holidayName && (
                        <div className="holiday-name">{holidayName}</div>
                    )}
                    <div className='event-show'>
                        {hasEvents && <div className="event-dot"></div>}
                        {multipleEvents && <div className="event-count">+{eventsForDate.length}</div>}
                    </div>             
                </div>
            );
        }
        return cells;
    };

//Showing previous & next month
    const previousMonth = () =>{
        const prev = new Date(year, month - 1, 1);
        setCurrentDate(prev);
    };
    const nextMonth = () =>{
        const next = new Date(year, month + 1, 1);
        setCurrentDate(next);
    };

//Modal Popup and add event functionality
    const [showModal, setShowModal] = useState(false);   
    const [eventTitle, setEventTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [eventDesc, setEventDesc] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);

    const resetForm = () => {
        setEventTitle('');
        setStartDate('');
        setEndDate('');
        setEventDesc('');
        setEditingIndex(null);
    };

    const handleAddEventClick = () => {
        resetForm();
        setShowModal(true);
    };

    const handleSaveEvent = (e) => {
    if (!eventTitle || !startDate || !endDate) {
        alert("Please fill in all fields");
        return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    //Logic for Start date > End date
    if (start > end) {
        alert("Start date must be less than or equal to end date");
        return;
    }
    // //Logic for event add only future and present date
    // if (start < today || end < today) {
    //     alert("You can only add events for today or future dates");
    //     return;
    // }
    const newEvent = {
        title: eventTitle,
        description: eventDesc,
        startDt: new Date(startDate + 'T00:00:00'),
        endDt: new Date(endDate + 'T00:00:00')
    };
    let updatedEvents = [...eventData];
    if (editingIndex !== null) {
        // Find the event to replace
        const eventToEdit = selectedEvents[editingIndex];
        updatedEvents = updatedEvents.map(ev => {
            if (
                ev.title === eventToEdit.title &&
                formatDate(new Date(ev.startDt)) === formatDate(new Date(eventToEdit.startDt)) &&
                formatDate(new Date(ev.endDt)) === formatDate(new Date(eventToEdit.endDt))
            ) {
                return newEvent;
            }
            return ev;
        });
    } else {
        updatedEvents.push(newEvent);
    }
    setEventData(updatedEvents);
    localStorage.setItem('eventData', JSON.stringify(updatedEvents));
    // Clear input fields and close modal
    setEventTitle('');
    setStartDate('');
    setEndDate('');
    setEventDesc('');
    setShowModal(false);
    setSelectedDate(null);
    setEditingIndex(null);
    alert(`Event ${editingIndex !== null ? "Updated" : "Saved"} Successfully`);
    };

//View Functionality
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const handleDateClick = (dateStr) => {
    const filteredEvents = eventData.filter(ev => {
        const startStr = formatDate(new Date(ev.startDt));
        const endStr = formatDate(new Date(ev.endDt));
        return dateStr >= startStr && dateStr <= endStr;
    });
    if(filteredEvents.length === 0) return;

    setSelectedDate(dateStr);
    setSelectedEvents(filteredEvents);
    };

//Edit functionality
    const handleEditEvent = (index) => {
        const event = selectedEvents[index];
        setEventTitle(event.title);
        setEventDesc(event.description);
        setStartDate(formatDate(new Date(event.startDt)));
        setEndDate(formatDate(new Date(event.endDt)));
        setEditingIndex(index);
        setSelectedDate(null);
        setShowModal(true);
    };

//Delete Functionality
    const handleDeleteEvent = (index) => {
        const eventToDelete = selectedEvents[index];
        const updatedEvents = eventData.filter(ev =>
            !(ev.title === eventToDelete.title && ev.startDt === eventToDelete.startDt && ev.endDt === eventToDelete.endDt)
        );
        setEventData(updatedEvents);
        localStorage.setItem('eventData', JSON.stringify(updatedEvents));
        setSelectedDate(null); 
    };   

    return(
        <>
        <div className='calendar-box'>
            <div className='calendar'>
                <h1>Calendar {year}</h1>
                <div className='calendar-header'>
                    <button onClick={previousMonth} className='btn-arrow'><FontAwesomeIcon icon={faAngleLeft}/></button>
                    <h2>{currentDate.toLocaleString('default',{ month:'long' })} {year}</h2>
                    <button onClick={nextMonth} className='btn-arrow'><FontAwesomeIcon icon={faAngleRight}/></button>
                    <button onClick={handleAddEventClick} className='btn-event'>Add Event</button>
                </div>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Add New Event</h2>
                            <button aria-label="Close modal" onClick={() => setShowModal(false)} className="modal-close">&times;</button>
                            <label>Event Title:</label>
                            <input type="text" placeholder='Enter Event Title' value={eventTitle} 
                                onChange={(e) => setEventTitle(e.target.value)}/><br/>
                            <label>Start Date:</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                                min={new Date().toISOString().split('T')[0]}/><br/>
                            <label>End Date:</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} 
                                min={new Date().toISOString().split('T')[0]}/><br/>
                            <label>Event Description:</label>
                            <textarea value={eventDesc} placeholder='Enter Description' onChange={(e) => setEventDesc(e.target.value)}/>                      
                            <div className="modal-buttons">
                                <button onClick = {handleSaveEvent} className="save-btn">Save</button>
                                <button onClick = {()=> setShowModal(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                {selectedDate && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Events on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB')}</h3>
                            <button aria-label="Close modal" onClick={() => setSelectedDate(null)} className="modal-close">&times;</button>
                            {selectedEvents.length > 0 &&
                                selectedEvents.map((event, index) => (
                                    <div key={index} className="event-item">
                                        <p><label>Event Title: </label>{event.title}</p>
                                        <p><label>Event Description: </label>{event.description}</p>
                                        <p><label>Start Date: </label>{formatDateDMY(new Date(event.startDt))}</p>
                                        <p><label>End Date: </label>{formatDateDMY(new Date(event.endDt))}</p>
                                        <button onClick={() => handleEditEvent(index)} className='btn-Edit'>Edit</button>
                                        <button onClick={() => handleDeleteEvent(index)} className='btn-Delete'>Delete</button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
                <div className='calendar-grid'>
                    {daysOfWeek.map((day,id) =>(
                        <div key={id} className={`calendar-cell header ${id === 0 ? 'sunday' : ''} 
                                                                    ${id === 6 ? 'saturday' : ''}`}>
                            {day}
                        </div>
                    ))}
                    {calendarCells()}
                </div>    
            </div>          
        </div>
        </>
    );
}

export default Calendar;
