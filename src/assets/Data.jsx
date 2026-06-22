// Structured schema for Add Event form
export const eventSchema = [
    { name: 'eventTitle', label: 'Event Title', type: 'text' ,required:true},
    { name: 'eventType', label: 'Event Type', type: 'select', optionsKey: 'eventType',required:true },
    { name: 'eventCategory', label: 'Event Category', type: 'select', optionsKey: 'eventCategory' ,required:true},
    { name: 'eventLevel', label: 'Event Level', type: 'select', optionsKey: 'eventLevel' ,required:true},
    { name: 'mode', label: 'Mode', type: 'select', optionsKey: 'mode' ,required:true},
    { name: 'platform', label: 'Platform (if Online/Hybrid)', type: 'text' },
    { name: 'venue', label: 'Venue (if Offline/Hybrid)', type: 'text' },
    { name: 'theme', label: 'Theme / Topic', type: 'text' ,required:true},
    { name: 'startDate', label: 'Start Date', type: 'date',required:true },
    { name: 'endDate', label: 'End Date', type: 'date' ,required:true},
    { name: 'objective', label: 'Objective', type: 'textarea',required:true },
    { name: 'durationDays', label: 'Duration (days)', type: 'number',required:true },
    { name: 'organizingDepartment', label: 'Organizing Department', type: 'select',optionsKey:'department',required:true },
    { name: 'coordinatorName', label: 'Coordinator Name', type: 'text' ,required:true},
    { name: 'coCoordinator', label: 'Co-coordinator (if any)', type: 'text' },
    { name: 'facultyMembers', label: 'Faculty Members (organizing committee)', type: 'text' },
    { name: 'studentCoordinators', label: 'Student Coordinators', type: 'text',required:true },
    { name: 'budgetSanctioned', label: 'Budget Sanctioned', type: 'number' },
    { name: 'sponsoringAgency', label: 'Sponsoring Agency', type: 'text' },
    { name: 'collaborationPartner', label: 'Collaboration Partner', type: 'text' },
    { name: 'totalRegistrations', label: 'Total Registrations', type: 'number' ,required:true},
    { name: 'totalAttended', label: 'Total Attended', type: 'number',required:true },
    { name: 'facultyCount', label: 'Faculty Count', type: 'number' ,required:true},
    { name: 'studentCount', label: 'Student Count', type: 'number',required:true },
    { name: 'externalParticipants', label: 'External Participants', type: 'number' ,required:true},
    { name: 'registrationLink', label: 'Registration Link', type: 'text',required:true },
    { name: 'registrationStartDate', label: 'Registration Start Date', type: 'date',required:true },
    { name: 'registrationEndDate', label: 'Registration End Date', type: 'date',required:true },
    { name: 'registrationFee', label: 'Registration Fee', type: 'number',required:true },
    { name: 'paymentMode', label: 'Payment Mode', type: 'select' , optionsKey:"mode",required:true },
    { name: 'attendanceReport', label: 'Attendance Report (file)', type: 'file' },
]


export const departments = [
  "BS & HSS",
  "Computer Science and Engineering",
  "Electrical and Electronics Engineering",
  "Electronics and Communication Engineering",
  "Civil Engineering",
  "Information Technology",
  "Metallurgical Engineering",
  "Mechanical Engineering",
  "Master's in Business Administration",
]

export const sessionSchema = [
    { name: 'sessionId', label: 'Session ID', type: 'text' },
    { name: 'sessionTitle', label: 'Session Title', type: 'text',required:true },
    { name: 'sessionDate', label: 'Session Date', type: 'date' ,required:true},
    { name: 'startTime', label: 'Start Time', type: 'time',required:true },
    { name: 'endTime', label: 'End Time', type: 'time',required:true },
    { name: 'speakerName', label: 'Speaker Name', type: 'text',required:true },
    { name: 'designation', label: 'Designation', type: 'text' },
    { name: 'organization', label: 'Organization', type: 'text' },
    { name: 'qualification', label: 'Qualification', type: 'text' },
    { name: 'expertiseArea', label: 'Expertise Area', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'mobile', label: 'Mobile', type: 'text' },
    { name: 'profileLink', label: 'Profile Link', type: 'text' },
    { name: 'honorarium', label: 'Honorarium', type: 'text' },
    { name: 'travelAllowance', label: 'Travel Allowance', type: 'text' },
    { name: 'sessionSummary', label: 'Session Summary', type: 'textarea',required:true },
    { name: 'photoFile', label: 'Photo (file)', type: 'file' }
]

export const documentFields = [
    'Proposal Copy',
    'Approval Copy',
    'Brochure',
    'Circular',
    'Schedule',
    'Attendance Sheets',
    'Feedback Forms',
    'Certificates',
    'Expenditure Statement',
    'Newspaper Coverage',
    'Gallery Link',
    'Website News Link',
    'Social Media Link',
    'Youtube Link'
]

export const selectOptions = {
    eventType: ['Workshop', 'FDP', 'Conference', 'Guest Lecture', 'Seminar', 'Webinar', 'Others'],
    eventCategory: ['Academic', 'Research', 'Skill Development', 'Industry Interaction', 'Others'],
    mode: ['Offline', 'Online', 'Hybrid'],
    eventLevel: ['Department', 'College', 'University', 'State', 'National', 'International'],
    department : departments
}

export const numberFields = ['durationDays', 'sessionCount', 'totalRegistrations', 'totalAttended', 'facultyCount', 'studentCount', 'externalParticipants']

export const dateFields = ['startDate', 'endDate', 'registrationStartDate', 'registrationEndDate']

//{ name: 'institutionWiseCount', label: 'Institution-wise Count', type: 'text' },