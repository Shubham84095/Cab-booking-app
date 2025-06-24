// HomePage.js
import { useEffect, useMemo, useState } from 'react';
import '../styles/HomePage.css';
import fireDb from "../firebase";
import routeImage from '../assets/routes.png';
import logo from '../assets/logo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from '@emailjs/browser';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [valuee, setValue] = useState(0);
  const [flag, setFlag] = useState(false);
  const [routeVisible, setRouteVisible] = useState(false);
  const [both, setBoth] = useState(true);

  const [bookedCab, setBookedCab] = useState({ amount: '', label: '', bookingTime: '', freeTime: '', value: '' });

  const places = [
    { value: -1, label: "Destination" },
    { value: 'A', label: "1" },
    { value: 'B', label: "2" },
    { value: 'C', label: "3" },
    { value: 'D', label: "4" },
    { value: 'E', label: "5" },
    { value: 'F', label: "6" },
  ];

  const [options, setOptions] = useState([
    { value: -1, label: "Select a cab" },
    { value: 5, label: "Cab 1" },
    { value: 4, label: "Cab 2" },
    { value: 3, label: "Cab 3" },
    { value: 2, label: "Cab 4" },
    { value: 1, label: "Cab 5" },
  ]);

  const graph = {
    A: { B: 5, C: 7 },
    B: { A: 5, E: 20, D: 15 },
    C: { A: 7, D: 5, E: 35 },
    D: { B: 15, C: 5, F: 20 },
    E: { C: 35, B: 20, F: 10 },
    F: { E: 10, D: 20 },
  };

  function shortestDistanceNode(distances, visited) {
    return Object.keys(distances).reduce((shortest, node) => {
      if (!visited.includes(node) && (shortest === null || distances[node] < distances[shortest])) {
        return node;
      }
      return shortest;
    }, null);
  }

  function findShortestPath(graph, start, end) {
    if (!graph[start] || !graph[end]) return { distance: Infinity, path: [] };
    let distances = { [end]: Infinity, ...graph[start] };
    let parents = {};
    for (let key in graph[start]) parents[key] = start;
    let visited = [];
    let node = shortestDistanceNode(distances, visited);

    while (node) {
      let distance = distances[node];
      for (let neighbor in graph[node]) {
        if (neighbor !== start) {
          let newDist = distance + graph[node][neighbor];
          if (!distances[neighbor] || distances[neighbor] > newDist) {
            distances[neighbor] = newDist;
            parents[neighbor] = node;
          }
        }
      }
      visited.push(node);
      node = shortestDistanceNode(distances, visited);
    }

    let path = [], parent = end;
    while (parent) {
      path.unshift(parent);
      parent = parents[parent];
    }

    return { distance: distances[end], path };
  }

  const { distance, path } = useMemo(() => findShortestPath(graph, pickup, drop), [pickup, drop]);
  const total = distance * valuee;
  const taxes = (total * 0.18).toFixed(2);

  const handleBookingContinue = () => {
    setFlag(true);
    const cab = options.find(opt => opt.value === Number(valuee));
    setBookedCab(prev => ({ ...prev, amount: total + +taxes, label: cab?.label || '', value: valuee }));
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // console.log(email)
    const bookingTime = new Date().toLocaleTimeString();
    const totalCost = total + +taxes;

    const bookingData = {
      ...bookedCab,
      bookingTime,
      freeTime: distance,
    };


    const templateParams = {
      user_email: email,
      route: path.join(' → '),
      estimated_time: distance,
      fare: valuee,
      taxes: taxes,
      total: totalCost,
      booking_time: bookingTime,
    };

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );
      toast.success("Confirmation email sent");
    } catch (error) {
      toast.error("Failed to send email");
      console.error("EmailJS Error:", error);
    }

    // Mark cab as booked
    setOptions(options.map(opt => opt.value === valuee ? { ...opt, value: 0 } : opt));
    setBoth(false);

    // Save booking to Firebase
    fireDb.child("bookings").push(bookingData, (err) => {
      if (err) toast.error("Booking failed");
      else toast.success("Booking confirmed");
    });
  };

  const handleResetBooking = () => {
    setFlag(false);
    setBoth(true);
    setValue(0);
  };

  const [data, setData] = useState({});
  useEffect(() => {
    fireDb.child("bookings").on("value", snapshot => {
      setData(snapshot.val() || {});
    });
    return () => fireDb.child("bookings").off();
  }, []);

  const deleteBooking = id => {
    if (window.confirm("Delete this booking?")) {
      fireDb.child(`bookings/${id}`).remove(err => {
        if (!err) toast.success("Booking deleted");
        else toast.error("Deletion failed");
      });
    }
  };

  return (
    <div className='mainDiv'>
      {both && !flag && (
        <div className='inputDiv'>
          <h1 className='heading'><img src={logo} alt="Logo" width={50} /> Take a ride!</h1>
          <input type="email" placeholder='user@gmail.com' value={email} onChange={e => setEmail(e.target.value)} />
          <select value={pickup} onChange={e => setPickup(e.target.value)}>
            {places.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select value={drop} onChange={e => setDrop(e.target.value)}>
            {places.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select value={valuee} onChange={e => setValue(Number(e.target.value))}>
            {options.map(opt => <option key={opt.label} value={opt.value}>{opt.label} {opt.value > 0 ? `- Rs${opt.value}/min` : opt.value === 0 ? ' - Booked' : ''}</option>)}
          </select>
          <div className='buttons'>
            <button onClick={() => setRouteVisible(true)}>See Routes</button>
            <button disabled={!email || pickup === drop || valuee <= 0} onClick={handleBookingContinue}>Continue</button>
          </div>
        </div>
      )}

      {both && flag && (
        <div className='inputDiv'>
          <h2>Checkout</h2>
          <p>Route: {path.join(' → ')}</p>
          <p>Email: {email}</p>
          <p>Fare: Rs {valuee}/min</p>
          <p>Estimated Time: {distance} mins</p>
          <p>Taxes (18%): Rs {taxes}</p>
          <p><strong>Total: Rs {bookedCab.amount}</strong></p>
          <button onClick={() => setFlag(false)}>Edit</button>
          <button onClick={confirmBooking}>Confirm</button>
        </div>
      )}

      {routeVisible && (
        <div className='routeView'>
          <img src={routeImage} alt="Routes" className="route-image" />
          <button onClick={() => setRouteVisible(false)}>Back</button>
        </div>
      )}

      {!both && (
        <div className='booked'>
          <h3>Booked Cabs</h3>
          {Object.entries(data).map(([id, booking]) => (
            <div key={id} className='bookings'>
              <p>{booking.label} - Booked at {booking.bookingTime}</p>
              <button onClick={() => deleteBooking(id)}>Delete</button>
            </div>
          ))}
          <button onClick={handleResetBooking}>Book another</button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}