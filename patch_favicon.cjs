const fs = require('fs');

const path = 'src/context/SettingsContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert the useEffect for the favicon inside SettingsProvider, right after setLoading(false) fetchSettings hook, 
// or simply anywhere in the Provider component before return.
const search = `  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {`;
const insert = `  useEffect(() => {
    if (settings.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;
    }
  }, [settings.logoUrl]);

`;

content = content.replace(search, insert + search);

fs.writeFileSync(path, content);
console.log("Favicon dynamic effect added");
