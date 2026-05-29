export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-12 px-4 pb-10 pt-8 text-[var(--sea-ink-soft)]">
      <div className="page-wrap text-center sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} Dynamic Decor · Images stay in your browser (localStorage).
        </p>
      </div>
    </footer>
  )
}
