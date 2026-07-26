const fs = require('fs');
let file = fs.readFileSync('/Users/utkarshsingh/Desktop/Zoom_Clone/frontend/src/app/meeting/[meeting_id]/page.tsx', 'utf8');
file = file.replace('const meetingId = params.meeting_id as string;', 'const meetingId = params?.meeting_id as string;');
file = file.replace('fetchMeeting();', 'if (meetingId) { fetchMeeting(); }');
fs.writeFileSync('/Users/utkarshsingh/Desktop/Zoom_Clone/frontend/src/app/meeting/[meeting_id]/page.tsx', file);
