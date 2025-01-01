"use client";
import React, { useEffect, useRef } from 'react';
import mapboxgl, { Map, GeoJSONSource, Popup } from 'mapbox-gl'; // Importing specific types
import 'mapbox-gl/dist/mapbox-gl.css';

const ClusterMapbox: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-103.5917, 40.6699],
        zoom: 3,
      });

      mapRef.current.on('load', () => {
        const map = mapRef.current as Map;

        map.addSource('earthquakes', {
          type: 'geojson',
          data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'earthquakes',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              750,
              '#f28cb1',
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'earthquakes',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
        });

        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'earthquakes',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
          },
        });

        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ['clusters'],
            });
          
            if (features.length) {
              const clusterId = features[0].properties?.cluster_id as number;
          
              (map.getSource('earthquakes') as GeoJSONSource).getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                  if (err || zoom === null || zoom === undefined) return;
          
                  map.easeTo({
                    center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
                    zoom,
                  });
                }
              );
            }
          });
          
        map.on('click', 'unclustered-point', (e) => {
          const coordinates = (e.features![0].geometry as GeoJSON.Point).coordinates.slice() as [
            number,
            number
          ];
          const mag = e.features![0].properties?.mag;
          const tsunami = e.features![0].properties?.tsunami === 1 ? 'yes' : 'no';

          new Popup()
            .setLngLat(coordinates)
            .setHTML(
              `Magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`
            )
            .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = '';
        });
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '100vh', width: '100%' }}
    />
  );
};

export default ClusterMapbox;
