import React, { useEffect, useRef } from 'react';
import './App.css';
import useSWR from 'swr'
import Wmata from './wmata.png'
import Paw from './paw.png'
import mapboxgl from 'mapbox-gl';
import dogParks from './dogParks';

function App() {
  mapboxgl.accessToken = process.env.REACT_APP_MID;
  const fetcher = url => fetch(url).then(r => r.json())

  const map = useRef();
  const { data: metroStations, error: metroStationError } = useSWR(
    'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Transportation_WebMercator/MapServer/51/query?where=1%3D1&outFields=OBJECTID,NAME,ADDRESS,LINE,Shape&outSR=4326&f=geojson',
    fetcher
  )
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

   

    // map.on('load', function () {
    //   map.addLayer({
    //   "id": "route",
    //   "type": "line",
    //   "source": {
    //   "type": "geojson",
    //   "data": data
    //   },
    //   "layout": {
    //   "line-join": "round",
    //   "line-cap": "round"
    //   },
    //   "paint": {
    //   "line-color": "#888",
    //   "line-width": 8
    //   }
    //   });
    //   });
  }, [map])

  useEffect(() => {
    if (!metroStations || metroStationError) return;
    
    metroStations.features.forEach(function (marker) {
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
  }, [metroStations, metroStationError, map])

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
