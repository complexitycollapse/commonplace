import { ZettelComponent } from './zettel-component';

export function ZettelFragment({ link, children }) {
  if (link?.type === "paragraph") {
    return (
      <p>
        {children.map(z => (<ZettelComponent zettel={z}></ZettelComponent>))}
      </p>
    );
  } else {
    return (
      children.map(z => (<ZettelComponent zettel={z}></ZettelComponent>))
    );
  }
}
