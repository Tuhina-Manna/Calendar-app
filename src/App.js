import React from "react";
import { CalendarProvider } from './context/CalendarContext';
import Calendar from './components/Calendar';
 
function App() {
  return(
    <CalendarProvider>
      <Calendar/>
    </CalendarProvider>
  )
}

export default App;
