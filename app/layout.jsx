
export const metadata = { title: 'GlamGossip — Celebrity Gossip & News' };
import './globals.css';

export default function RootLayout({ children }) {
  const adsClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <html lang="en">
      <head>
        {adsClient ? (
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" data-ad-client={adsClient}></script>
        ) : null}
      </head>
      <body>
        <nav className="nav">
          <div className="container navbar">
            <div className="brand">GlamGossip</div>
            <div className="links">
              <a className="link" href="/reviews">Latest Movie Reviews</a>
              <a className="link" href="/directory">Celebrity Directory</a>
              <a className="link" href="/controversies">Trending Controversies</a>
              <a className="link" href="/fashion">Red Carpet & Fashion</a>
              <a className="link" href="/interviews">Exclusive Interviews</a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="footer">
          <div className="container" style={{padding:'22px 16px', color:'#bbb'}}>© {new Date().getFullYear()} GlamGossip</div>
        </footer>
      </body>
    </html>
  );
}
