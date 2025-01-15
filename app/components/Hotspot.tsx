import {Popover} from "@headlessui/react";
import {Image} from '@shopify/hydrogen';

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

export function HotSpot({ banner, hotspots}: HotspotProps) {
  return (
    <div className="relative w-full h-auto">
        <div className="banner">
            <Image
                data={banner.image}
                sizes="(min-width: 45em) 50vw, 50vw"
                className="w-full h-screen object-cover"
            />
            <div className="absolute top-0 left-0 p-4 text-white">
            <h1 className="text-3xl font-bold text-black">{banner.title}</h1>
            <p className="text-lg text-black">{banner.byline}</p>
            </div>
        </div>
        <div className="hotspots">
            {hotspots.map((hotspot) => (
                <Popover
                    key={hotspot.id} 
                    className="absolute"
                    style={{
                    top: `${hotspot.position.y}%`,
                    left: `${hotspot.position.x}%`,
                }}>
                    <Popover.Button
                        className="hotspot-button bg-red-500 rounded-full w-4 h-4"
                    />
                    <Popover.Panel className="popover-content absolute bg-white p-4 shadow-lg rounded">
                    <div className="flex flex-col justify-center items-start">
                        <img
                            src={hotspot.imageUrl}
                            alt={hotspot.title}
                            className="w-16 h-16 object-cover mr-4"
                        />
                        <div>
                        <h2 className="text-lg font-bold">{hotspot.title}</h2>
                        <p className="text-sm text-gray-500">{hotspot.price}</p>
                    </div>
                    </div>
                    </Popover.Panel>
                </Popover>
            ))}
      </div>
    </div>
  );
}
