import { LOCALE } from '../game/locale';

export function SiteHeader() {
  return (
    <header className="site-header">
      <a
        className="site-header__link"
        href="https://spirzen.ru"
        target="_blank"
        rel="noopener noreferrer"
      >
        {LOCALE.SITE_UNIVERSE_LINK}
      </a>
    </header>
  );
}
