import React from 'react';
import '../App.css';

export default function ProjectDetails() {
  return (
    <div className={'projectDetails'}>
      <div className={'projectDetailsContent'}>
        <h2 className={'projectDetailsTitle'}>Project Details</h2>
        <p className={'projectDescription'}>
          Lorem ipsum dolor sit amet consectetur. Id justo pellentesque augue
          felis sit. Pulvinar enim semper nam venenatis neque mi non. Egestas
          vulputate pulvinar dignissim purus laoreet aenean rutrum. Imperdiet
          feugiat facilisi a suscipit quis viverra sem.
        </p>
        <div className={'statusContainer'}>
          <span className={'statusLabel'}>Status:</span>
          <span>Graduated</span>
        </div>
        <div className={'projectInfo'}>
          <div className={'infoLabels'}>
            <span className={'activeLabel'}>Active:</span>
            <span className={'sponsorLabel'}>Sponsor:</span>
            <span className={'mentorLabel'}>Mentor:</span>
          </div>
          <div className={'infoValues'}>
            <span className={'activeValue'}>June 2012 - April 2013</span>
            <span className={'sponsorValue'}>Some Company</span>
            <span className={'mentorValue'}>Some Person/Group</span>
          </div>
        </div>
      </div>
    </div>
  );
}
