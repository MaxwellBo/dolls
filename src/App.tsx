import React, { KeyboardEvent, useEffect, useRef } from 'react';
import { Helmet } from "react-helmet";
import './App.css'
import {
  useLoaderData,
  useRouteError,
  Outlet,
  Link,
  useSearchParams,
  useLocation
} from "react-router-dom";
import { loadUsers, MANIFEST_SCHEMA, User, loadCollection, Collection, Item, loadItem } from './manifest';

export function App() {
  return (
    <div>
      <ScrollToTop />
      <main>
        <Outlet />
      </main>
      <footer>
        <small>c. 2024, <a href="https://github.com/MaxwellBo/poppenhuis">source code</a>, <a href="https://maxbo.me">Max Bo</a></small>
      </footer>
    </div>
  )
}

export function ErrorPage() {
  const error: any = useRouteError();

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

export function UsersView() {
  const users = useLoaderData() as Awaited<ReturnType<typeof loadUsers>>;

  return (
    <article>
      <Helmet>
        <title>poppenhuis</title>
        <meta name="description" content={`a dollhouse`} />
      </Helmet>
      <header>
        <h1>
          poppenhuis /
        </h1>
      </header>
      <div className='cols'>
        <section>
          The following users have collections:
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <QueryPreservingLink to={user.id}>{user.name}</QueryPreservingLink> <Size ts={user.collections} t="collection" />
                <ul>
                  {
                    user.collections.map((collection) =>
                      <li key={collection.id}>
                        <QueryPreservingLink to={user.id + "/" + collection.id}>{collection.name}</QueryPreservingLink> <Size ts={collection.items} t="item" />
                        <ItemCard item={collection.items[0]} collection={collection} user={user} size='small' altName={''} />
                      </li>
                    )
                  }
                </ul>
              </li>
            ))}
          </ul>
        </section>
        <section className='short'>
          <p>
            poppenhuis (<i>Dutch for "dollhouse"</i>) is a site for displaying collections of 3D model scans.
            <br />
            <br />
            The scan collections can be of anything: pottery, sculptures, guitars, cars, cakes, plants, <i>dolls</i>, etc.
            <br />
            <br />

            It takes inspiration from <a href="https://www.are.na/">Are.na</a>, <a href="https://cari.institute/">Consumer&nbsp;Aesthetics&nbsp;Research&nbsp;Institute</a>, <a href="https://www.dayroselane.com/hydrants">The&nbsp;Hydrant&nbsp;Directory</a> and <a href="https://en.wikipedia.org/wiki/Tony_Hawk%27s_Pro_Skater_4">Tony Hawk's Pro Skater 4</a>.
            <br />
            <br />
            <small>(I discovered <a href="https://x.com/samdape/status/1777986265993875950">this Sam Peitz tweet</a>, <a href="https://kevin.garden">kevin.garden</a> and <a href="https://rotatingsandwiches.com/">rotating sandwiches</a> after first publish.)</small>
            <br />
            <br />
          </p>
          <details>
            <summary>Want to host your own content here?</summary>
            <ThirdPartyManifests />
          </details>
          <details>
            <summary>What file formats can poppenhuis render?</summary>
            poppenhuis uses <a href="https://modelviewer.dev/">model-viewer</a> for rendering 3D models,
            which only renders glTF/GLB (<code>.gltf/.glb</code>) files.
            <br />
            <br />
            Ideally poppenhuis would also support rendering Polygon File Format (<code>.ply</code>) for rendering <a href="https://en.wikipedia.org/wiki/Gaussian_splatting">Gaussian splats</a>. PRs welcome.
          </details>
          <details>
            <summary>Why?</summary>
            My partner has a large collection of dolls, so I built poppenhuis to make it easier for her to catalogue them and track metadata.

            Some of the dolls are culturally sensitive and shouldn't be displayed on a public forum, so she hosts her collection privately with a 3rd party manifest.
          </details>
        </section>
      </div>
    </article>
  );
}

const EXAMPLE_MANIFEST_URL = 'https://raw.githubusercontent.com/MaxwellBo/maxwellbo.github.io/master/poppenhuis-manifest.json'

function Size(props: { ts: unknown[], t: string }) {
  const { ts, t } = props;
  const plural = t && ts && ts.length > 1 ? "s" : "";

  return <span className='size'>({ts.length} {t}{plural})</span>;
}

function ThirdPartyManifests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [manifest, setManifest] = React.useState<string>(searchParams.get('manifest') ?? '');
  const [fetchResult, setFetchResult] = React.useState<string | undefined>(undefined);
  const [fetchStatus, setFetchStatus] = React.useState<JSX.Element>(<div />);

  const loadManifest = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.statusText}`);
      }
      setFetchResult(JSON.stringify(await response.json(), null, 2));
      setFetchStatus(<span className='green'>SUCCESS, 3rd-party manifest spliced into the 1st-party manifest</span>);
      setSearchParams({ manifest: url });
    } catch (e) {
      setFetchStatus(<span className='red'>{"ERROR: " + (e as any).message}</span>);
      setFetchResult(undefined);
    }
  }

  return (
    <>
      <b>1st party manifest</b>
      <br />
      If you'd like me to host your collection either:
      <ul>
        <li>submit a GitHub PR to <a href="https://github.com/MaxwellBo/poppenhuis">the repo</a> modifying <a href="https://github.com/MaxwellBo/poppenhuis/blob/master/src/manifest.tsx"><code>//src/manifest.tsx</code></a> and <a href="https://github.com/MaxwellBo/poppenhuis/tree/master/public/models"><code>//public/models</code></a>.</li>
        <li>reach out to <a href="https://twitter.com/_max_bo_">me on Twitter</a> and send me a <code>.zip</code> folder of your models and a Google Sheet of your metadata. I'll upload it for you if you're not technically inclined.</li>
      </ul>
      <br />
      <b>3rd party manifests</b>
      <br />
      You can view and share your own content on this site with manifest files.
      <br />
      <br />
      Your 3rd party manifest will be merged with the site's 1st party manifest, and the manifest URL will be stored in <code>?manifest=</code> query param so you can share your collections with others.
      <br />
      <br />
      <details>
        <summary>Manifest schema</summary>
        <pre>{MANIFEST_SCHEMA}</pre>
      </details>
      <input style={{ width: "80%", fontSize: 13 }} placeholder={EXAMPLE_MANIFEST_URL} value={manifest} onChange={e => setManifest(e.target.value)} />
      <br />
      <button disabled={!manifest} onClick={() => loadManifest(manifest)}>Load custom manifest</button>
      <br />
      <button onClick={() => {
        setManifest(EXAMPLE_MANIFEST_URL)
        loadManifest(EXAMPLE_MANIFEST_URL)
      }}>Load placeholder manifest</button>

      <br />
      <br />
      {fetchStatus}
      <pre className='truncate border'>{fetchResult}</pre>
    </>
  )
}

export function UserView() {
  const user = useLoaderData() as User;

  return (
    <article>
      <Helmet>
        <title>{user.name} - poppenhuis</title>
        <meta name="description" content={`Collections of 3D models by ${user.name}`} />
      </Helmet>
      <header>
        <h1>
          <QueryPreservingLink to="/">poppenhuis</QueryPreservingLink> / {user.name} /
        </h1>
        <div className='padding-bottom-1rem'>{user.bio}</div>
      </header>
      {user.collections.map((collection) =>
        <CollectionRow key={collection.id} collection={collection} user={user} />)}
    </article>
  );
}


export function CollectionView() {
  const { collection, user } = useLoaderData() as Awaited<ReturnType<typeof loadCollection>>;

  return <article className='collection-view'>
    <Helmet>
      <title>{collection.name} - poppenhuis</title>
      <meta name="description" content={`Collection of 3D models by ${user.name}`} />
    </Helmet>
    <header>
      <h1>
        <QueryPreservingLink to="/">poppenhuis</QueryPreservingLink> / <QueryPreservingLink to={`/${user.id}`}>{user.name}</QueryPreservingLink> / {collection.id} /
      </h1>
    </header>
    {collection.description && <p className='description'>{collection.description}</p>}
    <ItemCards collection={collection} user={user} />
  </article>
}

export function CollectionRow(props: { collection: Collection, user: User }) {
  const { collection, user } = props;
  return (
    <article className='collection-row'>
      <h3>
        <QueryPreservingLink to={`/${user.id}/${collection.id}`}>{collection.name}</QueryPreservingLink> <Size ts={collection.items} t="item" />
      </h3>
      {collection.description && <p className='short description'>{collection.description}</p>}
      <ItemCards {...props} limit={6} />
    </article>
  );
}

export function ItemCards(props: { collection: Collection, user: User, highlighted?: Item['id'], limit?: number }) {
  const { highlighted, limit, collection, user } = props;
  const { items } = collection;
  const showSeeMore = limit && items.length > limit;

  let truncatedItems: Item[] = [];
  // if there's a both a highlight AND a limit, we use a more complex heuristic to choose which items to show
  // Assume limit=5, highlighted=4, items.length=10
  // We want to show elements 0, 1, 2, 3, 4
  // But if limit=5, highlighted=5, items.length=10
  // We want to show elements 5, 6, 7, 8, 9
  if (highlighted && limit) {
    const highlightedIndex = items.findIndex((item: Item) => item.id === highlighted);
    const start = Math.floor(highlightedIndex / limit) * limit;
    const end = start + limit;
    truncatedItems = items.slice(start, end);
  } else if (limit) {
    // otherwise we just want to truncate to the limit
    truncatedItems = items.slice(0, limit);
  } else {
    truncatedItems = items;
  }

  return (
    <>
      <ul className='card-grid'>
        {truncatedItems.map((item) => (
          <li key={item.id} className={item.id === highlighted ? 'highlight fade' : undefined}>
            <ItemCard item={item} collection={collection} user={user} />
          </li>
        ))}
      </ul>
      {showSeeMore &&
        <div className='center see-more'>
          <QueryPreservingLink to={`/${user.id}/${collection.id}`}>see all {collection.name} →</QueryPreservingLink>
        </div>}
    </>
  );
}

function ItemCard(props: { item: Item, collection: Collection, user: User, altName?: string, size?: ModelSize, triggerKey?: string }) {
  return (
    <div className="card">
      <div className='center'>
        <ModelViewerWrapper item={props.item} size={props.size ?? 'normal'} />
        <QueryPreservingLink to={`/${props.user.id}/${props.collection.id}/${props.item.id}`} triggerKey={props.triggerKey}>
          {props.altName ?? props.item.name}
        </QueryPreservingLink>
        {props.triggerKey && <kbd className='block'>{props.triggerKey}</kbd>}
      </div>
    </div>
  );
}

export function ItemView() {
  const { item, user, collection } = useLoaderData() as Awaited<ReturnType<typeof loadItem>>;

  const previousItem: Item | undefined = collection.items.find((_, index) => collection.items[index + 1]?.id === item.id);
  const nextItem: Item | undefined = collection.items.find((_, index) => collection.items[index - 1]?.id === item.id);

  return (
    <article className='item-view'>
      <Helmet>
        <title>{item.name} - poppenhuis</title>
        <meta name="description" content={item.description} />
      </Helmet>
      <header>
        <h1>
          <QueryPreservingLink to="/">poppenhuis</QueryPreservingLink> / <QueryPreservingLink to={`/${user.id}`}>{user.name}</QueryPreservingLink> / <QueryPreservingLink to={`/${user.id}/${collection.id}`}>{collection.id}</QueryPreservingLink> / {item.name}
        </h1>
      </header>
      <p className='description'>{item.description}</p>
      <div className='previous-next'>
      </div>
      <div className='item-hero'>
        {previousItem ?
          <ItemCard item={previousItem} collection={collection} user={user} triggerKey="a" altName="← previous" size='small' /> : <div />}
        <ModelViewerWrapper item={item} size='big' />
        <ItemDescriptionList item={item} collection={collection} user={user} />
        {nextItem ?
          <ItemCard item={nextItem} collection={collection} user={user} triggerKey="d" altName="next →" size='small' /> : <div />}
      </div>
      <ItemCards collection={collection} user={user} highlighted={item.id} limit={6} />
    </article>
  );
}

function ItemDescriptionList(props: { item: Item, collection: Collection, user: User }) {
  const { captureLocation, captureLatLong } = props.item;
  let location;
  if (captureLocation && captureLatLong) {
    location = `${captureLocation} (${captureLatLong})`;
  } else if (captureLocation) {
    location = captureLocation;
  } else if (captureLatLong) {
    location = captureLatLong;
  }

  const { captureDevice, captureApp, captureMethod } = props.item;
  const method = [captureDevice, captureApp, captureMethod].filter(Boolean).join(', ');

  const customFields = props.item.customFields ? Object.entries(props.item.customFields).map(([key, value]) => {
    return (
      <React.Fragment key={key}>
        <dt>{key}</dt>
        <dd>{value}</dd>
      </React.Fragment>
    )
  }) : null;

  return (
    <dl>
      {
        props.item.formalName && <>
          <dt>Formal name</dt>
          <dd>{props.item.formalName}</dd>
        </>
      }
      <dt>User ID</dt>
      <dd>{props.user.id}</dd>
      <dt>Collection ID</dt>
      <dd>{props.collection.id}</dd>
      <dt>Item ID</dt>
      <dd>{props.item.id}</dd>
      <dt>Release date</dt>
      <dd>{props.item.releaseDate}</dd>
      <dt>Manufacture date</dt>
      <dd>{props.item.manufactureDate}</dd>
      <dt>Acquisition date</dt>
      <dd>{props.item.acquisitionDate}</dd>
      <dt>Capture date</dt>
      <dd>{props.item.captureDate}</dd>
      <dt>Capture location</dt>
      <dd>{location}</dd>
      <dt>Capture method</dt>
      <dd>{method}</dd>
      <dt>Model</dt>
      <dd>{props.item.model}</dd>
      {props.item.poster && <>
        <dt>Poster</dt>
        <dd>{props.item.poster}</dd>
      </>}
      {customFields}
    </dl>
  );
}

type ModelSize = 'small' | 'normal' | 'big';

function getStyleForModelSize(size: ModelSize | undefined) {
  switch (size) {
    case 'small':
      return { height: "6rem", width: "6rem" };
    case 'big':
      return { height: '35rem', width: "35rem" };
    case 'normal':
    default:
      return { height: "16rem", width: "16rem" };
  }
}

function ModelViewerWrapper(props: { item: Item, size?: ModelSize }) {
  return (
    <div className='model-viewer-wrapper'>
      {/* @ts-ignore */}
      <model-viewer
        key={props.item.model}
        style={getStyleForModelSize(props.size)}
        alt={props.item.description}
        src={props.item.model}
        interaction-prompt=""
        progress-bar=""
        loading="auto"
        poster={props.item.poster}
        auto-rotate-delay="0"
        rotation-per-second="30deg"
        camera-controls
        auto-rotate
        touch-action="pan-y"
      />
    </div>
  );
}

// UTILS

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}



function QueryPreservingLink(props: { to: string, children: React.ReactNode, triggerKey?: string }) {
  const [searchParams] = useSearchParams();
  const linkRef = useRef<HTMLAnchorElement>(null);

  // we want to register a key to trigger the link click on keydown
  useEffect(() => {
    if (!props.triggerKey) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === props.triggerKey) {
        if (linkRef.current) {
          linkRef.current.click();
        }
      }
    };

    // @ts-ignore
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // @ts-ignore
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <Link ref={linkRef} to={{ pathname: props.to, search: searchParams.toString() }}>{props.children}</Link>
}
