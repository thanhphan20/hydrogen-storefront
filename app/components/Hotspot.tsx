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
        <div className="absolute top-0 left-0 p-4 text-white">
          <h1 className="text-3xl font-bold text-black">{banner.title}</h1>
          <p className="text-lg text-black">{banner.byline}</p>
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
                  className="h-4 w-4 rounded-full bg-red-500 transition hover:scale-110"
                />
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white p-4 shadow-lg">
                <div className="flex items-start gap-4">
                  <img
                    src={hotspot.imageUrl}
                    alt={hotspot.title}
                    className="h-16 w-16 object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-bold">{hotspot.title}</h2>
                    <p className="text-sm text-gray-500">{hotspot.price}</p>
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
