import SwaggerUIComponent from './swagger-ui';

export const metadata = {
  title: 'API | TownOfUs.pl',
  description: 'Publiczne API danych Drama Afera',
};

// Publiczna dokumentacja. Strona nie wymaga logowania.
export default function DocsPage() {
  return <SwaggerUIComponent />;
}
