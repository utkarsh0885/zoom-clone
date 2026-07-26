const fs = require('fs');
const file = '/Users/utkarshsingh/Desktop/Zoom_Clone/frontend/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add mounted state
content = content.replace(
  'export default function Home() {',
  `export default function Home() {\n  const [mounted, setMounted] = React.useState(false);\n  React.useEffect(() => {\n    setMounted(true);\n    const timer = setInterval(() => setCurrentTime(new Date()), 60000);\n    return () => clearInterval(timer);\n  }, []);`
);

// Fix currentTime
content = content.replace(
  'const currentTime = new Date();',
  'const [currentTime, setCurrentTime] = React.useState(new Date());'
);

// Fix greeting
content = content.replace(
  '<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting}, User</h1>',
  '<h1 className="text-2xl sm:text-3xl font-bold tracking-tight" suppressHydrationWarning>{mounted ? greeting : "Welcome"}, User</h1>'
);

// Fix displayDate and displayTime in the header
content = content.replace(
  /<p className="text-gray-200 mt-1 sm:mt-2 text-sm sm:text-base">\s*\{displayDate\} • \{displayTime\}\s*<\/p>/,
  '<p className="text-gray-200 mt-1 sm:mt-2 text-sm sm:text-base" suppressHydrationWarning>\n                  {mounted ? `${displayDate} • ${displayTime}` : "Loading time..."}\n                </p>'
);

// Fix the desktop clock
content = content.replace(
  /<p className="text-4xl font-bold tracking-tight">\{displayTime\}<\/p>\s*<p className="text-gray-200 mt-1">\{displayDate\}<\/p>/,
  '<p className="text-4xl font-bold tracking-tight" suppressHydrationWarning>{mounted ? displayTime : "--:--"}</p>\n                <p className="text-gray-200 mt-1" suppressHydrationWarning>{mounted ? displayDate : "Loading..."}</p>'
);

fs.writeFileSync(file, content);
console.log('Clock hydration fixed.');
