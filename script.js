// Track all courses
let courses = [];

// Initialize - Add first course on load
document.addEventListener('DOMContentLoaded', () => {
  addNewCourse();
});

// Add a new course input field
document.getElementById('add-course-btn').addEventListener('click', addNewCourse);

function addNewCourse() {
  const container = document.getElementById('courses-container');
  const courseId = Date.now(); // Unique ID

  const courseDiv = document.createElement('div');
  courseDiv.className = 'course';
  courseDiv.innerHTML = `
    <div class="course-header">
      <input type="text" placeholder="Course Name (e.g., Math 101)" class="course-name">
      <button class="remove-btn" data-id="${courseId}">Remove Course</button>
    </div>
    <div class="time-slots" id="slots-${courseId}"></div>
    <button class="add-slot-btn" data-id="${courseId}">➕ Add Time Slot</button>
  `;
  container.appendChild(courseDiv);

  // Add first time slot by default
  addTimeSlot(courseId);
}

// Add time slot to a course
function addTimeSlot(courseId) {
  const slotsDiv = document.getElementById(`slots-${courseId}`);
  const slotDiv = document.createElement('div');
  slotDiv.className = 'time-slot';
  slotDiv.innerHTML = `
    <select class="day">
      <option>Monday</option>
      <option>Tuesday</option>
      <option>Wednesday</option>
      <option>Thursday</option>
      <option>Friday</option>
    </select>
    <input type="time" class="start-time" value="09:00">
    <span>to</span>
    <input type="time" class="end-time" value="10:30">
    <button class="remove-btn remove-slot-btn">❌</button>
  `;
  slotsDiv.appendChild(slotDiv);
}

// Handle button clicks dynamically
document.addEventListener('click', (e) => {
  // Add time slot
  if (e.target.classList.contains('add-slot-btn')) {
    const courseId = e.target.getAttribute('data-id');
    addTimeSlot(courseId);
  }
  // Remove time slot
  if (e.target.classList.contains('remove-slot-btn')) {
    e.target.closest('.time-slot').remove();
  }
  // Remove entire course
  if (e.target.classList.contains('remove-btn') && !e.target.classList.contains('remove-slot-btn')) {
    e.target.closest('.course').remove();
  }
});

// Generate the optimal schedule
document.getElementById('generate-btn').addEventListener('click', () => {
  courses = [];
  const courseElements = document.querySelectorAll('.course');

  // Extract data from form
  courseElements.forEach(courseEl => {
    const name = courseEl.querySelector('.course-name').value.trim();
    const slots = Array.from(courseEl.querySelectorAll('.time-slot')).map(slot => ({
      day: slot.querySelector('.day').value,
      start: slot.querySelector('.start-time').value,
      end: slot.querySelector('.end-time').value
    }));

    if (name && slots.length > 0) {
      courses.push({ name, slots });
    }
  });

  // Generate schedule
  const assignedSlots = [];
  const schedule = {};
  const warnings = [];

  for (const course of courses) {
    let assigned = false;
    for (const slot of course.slots) {
      const conflict = assignedSlots.some(assignedSlot => 
        assignedSlot.day === slot.day && 
        assignedSlot.start < slot.end && 
        assignedSlot.end > slot.start
      );

      if (!conflict) {
        assignedSlots.push({ ...slot, course: course.name });
        schedule[course.name] = slot;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      warnings.push(`Could not assign ${course.name} without conflicts`);
    }
  }

  // Display results
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  for (const [course, slot] of Object.entries(schedule)) {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `<strong>${course}</strong>: ${slot.day} ${slot.start}-${slot.end}`;
    calendar.appendChild(div);
  }

  // Show warnings
  const warningsDiv = document.getElementById('warnings');
  warningsDiv.innerHTML = warnings.join('<br>');

  // Show results section
  document.getElementById('schedule-results').style.display = 'block';
});