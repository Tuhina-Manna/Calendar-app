import React, { createContext, useState } from 'react';
//import Holidays from 'date-holidays';

const CalendarContext = createContext();

const CalendarProvider = ({children}) => {
    const today = new Date();
    const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const [currentDate, setCurrentDate] = useState(localDate);

    return(
        <CalendarContext.Provider value={{currentDate, setCurrentDate}}>
            {children}
        </CalendarContext.Provider>
    );
}

export {CalendarContext, CalendarProvider};
