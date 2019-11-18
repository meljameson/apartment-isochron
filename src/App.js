import React, { useEffect, useRef } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import './App.css';
import useSWR from 'swr'
import Wmata from './wmata.png'
import Paw from './paw.png'
import ET from './ET.png'
import mapboxgl from 'mapbox-gl';
import dogParks from './data/dogParks';
import stations from './data/stations';
import lines from './data/lines';
import gyms from './data/gyms';
let Poi = null;
let poi = null;
if (process.env.NODE_ENV === 'development') {
  Poi = require('./poi.jpeg');
  poi = require('./data/poi');
}

const ISO_SOURCES = {
  drive: {
    sourceName: 'drivingIso',
    layerName: 'drivingLayer',
    color: '#6706ce',
    type: 'driving',
    location: '-76.928640,38.982650',
    minutes: 30
  },
  bike: {
    sourceName: 'bikingIso',
    layerName: 'bikingLayer',
    color: '#6706ce',
    type: 'cycling',
    location: '-76.928640,38.982650',
    minutes: 20
  },
  poi: {
    sourceName: 'poiIso',
    layerName: 'poiLayer',
    color: '#6706ce',
    type: 'driving',
    location: '-77.116810,38.897670',
    minutes: 35
  }
}

mapboxgl.accessToken = process.env.REACT_APP_MID;
const fetcher = url => fetch(url).then(r => r.json())

function App() {
  const apartments = null;
  const map = useRef();
  // const { data: metroStations, error: metroStationError } = useSWR(
  //   'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Transportation_WebMercator/MapServer/51/query?where=1%3D1&outFields=OBJECTID,NAME,ADDRESS,LINE,Shape&outSR=4326&f=geojson',
  //   fetcher
  // )

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

    map.current.addControl(new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl
    }));

    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    map.current.on('load', function () {
      for (const source of Object.values(ISO_SOURCES)) {
        map.current.addSource(source.sourceName, {
          type: 'geojson',
          data: {
            'type': 'FeatureCollection',
            'features': []
          }
        });
        map.current.addLayer({
          'id': source.layerName,
          'type': 'fill',
          'source': source.sourceName,
          'layout': {},
          'paint': {
            'fill-color': source.color,
            'fill-opacity': 0.3
          }
        }, "poi-label");

        fetch(`https://api.mapbox.com/isochrone/v1/mapbox/${source.type}/${source.location}?contours_minutes=${source.minutes}&polygons=true&access_token=${process.env.REACT_APP_MID}`)
          .then(res => res.json())
          .then(data => map.current.getSource(source.sourceName).setData(data))
      }

      var toggleableLayerIds = ['drivingLayer', 'bikingLayer', 'poiLayer'];
      for (var i = 0; i < toggleableLayerIds.length; i++) {
        var id = toggleableLayerIds[i];

        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = id;

        link.onclick = function (e) {
          var clickedLayer = this.textContent;
          e.preventDefault();
          e.stopPropagation();

          var visibility = map.current.getLayoutProperty(clickedLayer, 'visibility');

          if (visibility === 'visible') {
            map.current.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
          } else {
            this.className = 'active';
            map.current.setLayoutProperty(clickedLayer, 'visibility', 'visible');
          }
        };

        var layers = document.getElementById('menu');
        layers.appendChild(link);
      }

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
    if (!poi) return;

    poi.features.forEach(function (marker) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${Poi})`
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

  return (
    <>
      <div id="map" />
      <div id="menu" />

      {/* <div class='absolute fl my24 mx24 py24 px24 bg-gray-faint round'>
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
      </div> */}



    </>
  );
}

export default App;