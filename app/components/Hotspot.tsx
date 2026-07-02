import {Image} from '@shopify/hydrogen';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

interface HotspotProps {
  banner: {
    image: {
      url: string;
      altText: string;
    };
    title: string;
    byline: string;
  };
  hotspots: {
    id: string;
    title: string;
    imageUrl: string;
    price: string;
    descriptionHtml: string;
    position: {
      x: number;
      y: number;
    };
  }[];
}

export function HotSpot({banner, hotspots}: HotspotProps) {
  return (
    <div className="relative h-auto w-full">
      <div className="banner">
        <Image
          data={banner.image}
          sizes="(min-width: 45em) 50vw, 50vw"
          className="h-screen w-full object-cover"
        />
        <div className="absolute top-0 left-0 p-4 text-foreground">
          <h1 className="text-3xl font-semibold tracking-tight">{banner.title}</h1>
          <p className="text-lg text-muted-foreground">{banner.byline}</p>
        </div>
      </div>
      <div className="hotspots">
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="absolute"
            style={{
              top: `${hotspot.position.y}%`,
              left: `${hotspot.position.x}%`,
            }}
          >
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-4 w-4 rounded-full border border-background bg-foreground transition hover:scale-110"
                />
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={hotspot.imageUrl}
                    alt={hotspot.title}
                    className="h-16 w-16 object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{hotspot.title}</h2>
                    <p className="text-sm text-muted-foreground">{hotspot.price}</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
    </div>
  );
}
