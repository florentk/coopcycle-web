import React from 'react';
import { render } from 'react-dom';
import 'whatwg-fetch';
import OrderList from './OrderList.jsx'
import OrderDetails from './OrderDetails.jsx'

const hostname = window.location.hostname;
const restaurant = window.__restaurant;

let orderList;
let orderDetails;

setTimeout(function() {

  var socket = io('//' + hostname, {path: '/restaurant-panel/socket.io'});

  socket.on('connect', () => socket.emit('restaurant', restaurant));
  socket.on('order', data => orderList.addOrder(data));

}, 1000);

orderList = render(
  <OrderList
    orders={ window.__orders }
    i18n={ window.__i18n }
    onOrderClick={ (order) => orderDetails.setOrder(order) } />,
  document.getElementById('order-list')
);

orderDetails = render(
  <OrderDetails
    routes={ window.__routes }
    i18n={ window.__i18n } />,
  document.getElementById('order-details')
);
