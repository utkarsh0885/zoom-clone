const fs = require('fs');
const file = '/Users/utkarshsingh/Desktop/Zoom_Clone/frontend/src/ui/MeetingCard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<span>\{formattedDate\}<\/span>/g,
  '<span suppressHydrationWarning>{formattedDate}</span>'
);

content = content.replace(
  /<span>\{formattedTime\} \{meeting\.duration \? `\(\$\{meeting\.duration\} min\)` : ''\}<\/span>/g,
  '<span suppressHydrationWarning>{formattedTime} {meeting.duration ? `(${meeting.duration} min)` : \'\'}</span>'
);

content = content.replace(
  /<span className="text-gray-900 font-medium">\{formattedDate\} at \{formattedTime\}<\/span>/g,
  '<span className="text-gray-900 font-medium" suppressHydrationWarning>{formattedDate} at {formattedTime}</span>'
);

fs.writeFileSync(file, content);
console.log('Hydration warnings suppressed.');
