export const metadata = {
  title: "HR Codex — Free Employment Compliance Assessment",
  description: "Free interactive compliance assessment for small business owners. Check your compliance with federal and state employment laws in minutes. Get your score and actionable recommendations.",
  keywords: "HR compliance, employment law, small business compliance, state labor laws, compliance assessment, HR audit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
