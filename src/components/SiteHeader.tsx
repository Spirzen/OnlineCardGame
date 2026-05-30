import { LOCALE } from '../game/locale';

export function SiteHeader() {
  return (
    <header className="site-header">
      <a
        className="site-header__link"
        href="https://skazki.rustih.ru/ural-batyr/"
        target="_blank"
        rel="noopener noreferrer"
      >
        {LOCALE.SITE_UNIVERSE_LINK}
      </a>
    </header>
  );
}
