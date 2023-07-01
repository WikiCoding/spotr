let lat = 0; // 41.0463411
let lng = 0; // -8.6490691
let locationsAdded = JSON.parse(localStorage.getItem('addedLocation')) || []
const locationsList = document.querySelector('.locationsList');

const popupForm = "<h2>Adding New Location</h2><div><label>Name:</label><input type='text' id='placeName' required placeHolder='Ramalde Skatepark' /></div><div><label>Description:</label><input type='text' id='placeDesc' placeHolder='Skatepark for street, starter level'/><div><label>City, Country: </label><input type='text' id='placeCity' placeHolder='Porto, Portugal' /></div></div><div><label>Notes:</label><input type='text' id='placeNotes' placeHolder='Very small ramps'/></div><button id='addBtn'>Add</button>"

const getPos = async (res) => {
  lat = await res.coords.latitude;
  lng = await res.coords.longitude;

  const renderMarkers = () => {
    locationsList.innerHTML = '';

    locationsAdded.forEach(location => {
      const popupContent = `<div><h4>Name: ${location.name}</h4></div><div><h4>Description: ${location.description}</h4></div><div><h4>Notes: ${location.notes}</h4></div><div><h4>City, Country: ${location.city}</h4></div><div><h4>Created At: ${new Date(location.createdAt).toLocaleDateString()}</h4></div><div><a href='https://www.google.pt/maps/@${location.lat},${location.long},20.43z?entry=ttu'>Go to Google Maps</a><div><button class='del-btn'>Delete</button></div>`;

      L.marker([location.lat, location.long]).addTo(map).bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false
      })).setPopupContent(popupContent);

      const container = document.createElement('div');

      let finalName = '';

      if (location.name.includes('.')) {
        const correctedName = location.name.split('.');
        correctedName.forEach(nameIndice => {
          finalName = finalName + nameIndice;
        })
        console.log(finalName);
      }

      const containerContent = `<div><h4>Name: ${location.name}</h4></div><div><h4>Description: ${location.description}</h4></div><div><h4>Notes: ${location.notes}</h4></div><div><h4>City, Country: ${location.city}</h4></div><div><h4>Created At: ${new Date(location.createdAt).toLocaleDateString()}</h4></div><div><div><button class="loc-Name${finalName}">Go to marker on this map</button></div><a href='https://www.google.pt/maps/@${location.lat},${location.long},20.43z?entry=ttu'>Go to Google Maps</a><hr>`;

      container.innerHTML = containerContent;

      locationsList.appendChild(container);

      const locName = document.querySelector(`.loc-Name${finalName}`);

      if (locName !== null) {
        locName.addEventListener('click', () => {
          map.setView([location.lat, location.long], 15);

          document.body.scrollTop = document.documentElement.scrollTop = 40
        })
      }


    })
  }

  const map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // custom Icon for the current location
  const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const marker = L.marker([lat, lng], { icon: greenIcon }).addTo(map);

  //adding popup to the marker
  marker.bindPopup("<b>My current position</b><br>I am currently here.");

  renderMarkers();

  map.on('popupopen', (e) => {
    const dataToDelete = e.target._container.innerText.split('\n')[0].replace('Name:', '').trim();

    const locationsUpdated = locationsAdded.filter(s => s.name !== dataToDelete);

    // const [locationClicked] = locationsAdded.filter(s => s.name === dataToDelete);

    // const newMarker = L.marker([locationClicked.lat, locationClicked.long])

    const delBtn = document.querySelector('.del-btn');

    delBtn?.addEventListener('click', () => {
      localStorage.clear();
      locationsAdded = locationsUpdated
      localStorage.setItem('addedLocation', JSON.stringify(locationsAdded));

      // map.removeLayer(newMarker);
      // map.closePopup();

      // renderMarkers();
      document.location.reload();
    })
  })

  const currentLoc = document.querySelector('.currentLoc');
  currentLoc.addEventListener('click', (e) => {
    const newMarker = L.marker([lat, lng]).addTo(map);

    marker.bindPopup(popupForm).openPopup();

    const locationName = document.getElementById('placeName');
    const placeDesc = document.getElementById('placeDesc');
    const placeNotes = document.getElementById('placeNotes');
    const placeCity = document.getElementById('placeCity');

    const btn = document.getElementById('addBtn');

    btn.addEventListener('click', () => {
      if (locationName.value.length > 0) {
        const newLocation = { name: locationName.value.trim(), city: placeCity.value.trim(), description: placeDesc.value, notes: placeNotes.value, lat, long: lng, createdAt: Date.now() }
        locationsAdded.push(newLocation);

        localStorage.setItem('addedLocation', JSON.stringify(locationsAdded));

        newMarker.closePopup();

        renderMarkers();


      } else {
        alert('Name cannot be empty');
      }
    })
  })

  function onMapClick(e) {

    const newMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

    newMarker.bindPopup(popupForm).openPopup();

    const locationName = document.getElementById('placeName');
    locationName.focus();

    const btn = document.getElementById('addBtn');

    btn.addEventListener('click', () => {

      if (locationName.value.length > 0) {
        const newLocation = { name: locationName.value.trim(), city: placeCity.value.trim(), description: placeDesc.value, notes: placeNotes.value, lat: e.latlng.lat, long: e.latlng.lng, createdAt: Date.now() }

        locationsAdded.push(newLocation);

        localStorage.setItem('addedLocation', JSON.stringify(locationsAdded));

        newMarker.closePopup();

        renderMarkers();

         document.location.reload();
      } else {
        alert('Name cannot be empty');
      }

    })
  }

  map.on('click', onMapClick);

}

navigator.geolocation.getCurrentPosition(getPos);
