import React, { useEffect, useRef } from 'react';
import './App.css';
import useSWR from 'swr'
import Wmata from './wmata.png'
import Paw from './paw.png'
import mapboxgl from 'mapbox-gl';
import dogParks from './data/dogParks';
import stations from './data/stations';
import lines from './data/lines';

function App() {
  mapboxgl.accessToken = process.env.REACT_APP_MID;
  const fetcher = url => fetch(url).then(r => r.json())
// 
  const map = useRef();
  // const { data: metroStations, error: metroStationError } = useSWR(
  //   'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Transportation_WebMercator/MapServer/51/query?where=1%3D1&outFields=OBJECTID,NAME,ADDRESS,LINE,Shape&outSR=4326&f=geojson',
  //   fetcher
  // )

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-77.04, 38.907],
      zoom: 11.15
    });

    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    map.current.on('load', function () {
      map.current.addLayer({
        'id': 'lines',
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': lines
        },
        'paint': {
          'line-width': 3,
          // Use a get expression (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-get)
          // to set the line-color to a feature property value.
          'line-color': ['get', 'color']
        }
      });
    });
  }, [map])

  useEffect(() => {
    if (!stations) return;

    stations.features.forEach(function (marker) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${Wmata})`
      el.style.width = '15px';
      el.style.height = '15px';
      el.style.backgroundSize = '15px';
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setText(marker.properties.NAME);
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [map])

  useEffect(() => {
    if (!dogParks) return;

    dogParks.features.forEach(function (marker) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${Paw})`
      el.style.width = '15px';
      el.style.height = '15px';
      el.style.backgroundSize = '15px';
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setText(marker.properties.NAME);
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [map])

  return (
    <div id="map" />
  );
}

export default App;

// colors: {
//   green: 9, 153, 81
//   blue: 8, 108, 180
//   silver: 160,160,160
//   orange:240,130,36
//   red:230,57,50
//   yelllow:246,213, 15
// }