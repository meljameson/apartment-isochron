import React, { useEffect, useRef } from 'react';
import './App.css';
import useSWR from 'swr'
import Wmata from './wmata.png'
import Paw from './paw.png'
import ET from './ET.png'
import Laurel from './laurel.jpeg'
import mapboxgl from 'mapbox-gl';
import dogParks from './data/dogParks';
import stations from './data/stations';
import lines from './data/lines';
import laurel from './data/laurel';
import gyms from './data/gyms';

function App() {
  mapboxgl.accessToken = process.env.REACT_APP_MID;
  const fetcher = url => fetch(url).then(r => r.json())

  const map = useRef();
  // const { data: metroStations, error: metroStationError } = useSWR(
  //   'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Transportation_WebMercator/MapServer/51/query?where=1%3D1&outFields=OBJECTID,NAME,ADDRESS,LINE,Shape&outSR=4326&f=geojson',
  //   fetcher
  // )

  const apartments = null;

  // get driving isochrone
  const { data, error } = useSWR(
    `https://api.mapbox.com/isochrone/v1/mapbox/driving/-77.04,38.907?contours_minutes=30&polygons=true&access_token=${process.env.REACT_APP_MID}`,
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

    map.current.on('load', function () {
      // When the map loads, add the source and layer
      map.current.addSource('iso', {
        type: 'geojson',
        data: {
          'type': 'FeatureCollection',
          'features': []
        }
      });

      map.current.addLayer({
        'id': 'isoLayer',
        'type': 'fill',
        // Use "iso" as the data source for this layer
        'source': 'iso',
        'layout': {},
        'paint': {
          // The fill color for the layer is set to a light purple
          'fill-color': '#5a3fc0',
          'fill-opacity': 0.3
        }
      }, "poi-label");

      fetch(`https://api.mapbox.com/isochrone/v1/mapbox/driving/-77.04,38.907?contours_minutes=30&polygons=true&access_token=${process.env.REACT_APP_MID}`)
      .then(res => res.json())
      .then(data => map.current.getSource('iso').setData(data))

      map.current.addLayer({
        'id': 'lines',
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': lines
        },
        'paint': {
          'line-width': 3,
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
    if (!laurel) return;

    laurel.features.forEach(function (marker) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${Laurel})`
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
    if (!gyms) return;

    gyms.features.forEach(function (marker) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${ET})`
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

  // add apartments
  useEffect(() => {
    if (!apartments) return;

    apartments.features.forEach(function (marker) {
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
  }, [apartments, map])

  // useEffect(() => {
  //   if (!data) return;
  //   // data runs before the map load
  //   console.log(data)
  //   map.current.getSource('iso') && map.current.getSource('iso').setData(data);
  // }, [data, map, map.current.getSource('iso')])

  return (
    <>
      <div id="map" />


      <div class='absolute fl my24 mx24 py24 px24 bg-gray-faint round'>
        <form id='params'>
          <h4 class='txt-m txt-bold mb6'>Chose a travel mode:</h4>
          <div class='mb12 mr12 toggle-group align-center'>
            <label class='toggle-container'>
              <input name='profile' type='radio' value='walking' />
              <div class='toggle toggle--active-null toggle--null'>Walking</div>
            </label>
            <label class='toggle-container'>
              <input name='profile' type='radio' value='cycling' checked />
              <div class='toggle toggle--active-null toggle--null'>Cycling</div>
            </label>
            <label class='toggle-container'>
              <input name='profile' type='radio' value='driving' />
              <div class='toggle toggle--active-null toggle--null'>Driving</div>
            </label>
          </div>
          <h4 class='txt-m txt-bold mb6'>Chose a maximum duration:</h4>
          <div class='mb12 mr12 toggle-group align-center'>
            <label class='toggle-container'>
              <input name='duration' type='radio' value='10' checked />
              <div class='toggle toggle--active-null toggle--null'>10 min</div>
            </label>
            <label class='toggle-container'>
              <input name='duration' type='radio' value='20' />
              <div class='toggle toggle--active-null toggle--null'>20 min</div>
            </label>
            <label class='toggle-container'>
              <input name='duration' type='radio' value='30' />
              <div class='toggle toggle--active-null toggle--null'>30 min</div>
            </label>
          </div>
        </form>
      </div>



    </>
  );
}

export default App;