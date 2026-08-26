import React from 'react';
import TravelCrud from './TravelCrud.jsx';
import {normalizeTravelRoot} from './travel-derived.js';

export default function Travel(props){
  const normalizedTravel=normalizeTravelRoot(props.data?.travel);
  return <TravelCrud {...props} data={{...props.data,travel:normalizedTravel}}/>;
}
