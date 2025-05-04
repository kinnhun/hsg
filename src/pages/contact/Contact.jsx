import React, { useState } from 'react'
import ContactTeacher from './ContactTeacher/ContactTeacher';
import ContactParents from './ContactParents/ContactParents';

const Contact = () => {
  const [showComponent, setShowComponent] = useState('teacher');

  const handleClick = (component) => {
    setShowComponent(component);
  };

  return (
    <div className="w-full">
      <div className="flex gap-4 p-2 pl-4">
        <button
          className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => handleClick('teacher')}
        >
          Liên hệ với Giáo viên
        </button>

        <button
          className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => handleClick('parents')}
        >
          Liên hệ với Phụ huynh
        </button>
      </div>

      <div className="mt-4">
        {showComponent === 'teacher' && <ContactTeacher />}
        {showComponent === 'parents' && <ContactParents />}
      </div>
    </div>
  )
}

export default Contact
