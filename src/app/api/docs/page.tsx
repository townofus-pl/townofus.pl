import SwaggerUIComponent from './swagger-ui';

export const metadata = {
  title: 'API Documentation | TownOfUs.pl',
  description: 'REST API documentation for the Polish Among Us community website',
};

export default function DocsPage() {
  return <SwaggerUIComponent />;
}