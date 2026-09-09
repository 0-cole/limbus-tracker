import React, { useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useStore } from '../stores/useStore';

export default function TutorialTour() {
  const { onboardingCompleted, tutorialCompleted, setTutorialCompleted } = useStore();
  const [run, setRun] = useState(true);

  // Do not run tutorial until they finish the onboarding modal, or if they already did it
  if (!onboardingCompleted || tutorialCompleted) return null;

  const steps = [
    {
      target: '.sidebar-item:nth-child(1)',
      content: 'Welcome to your Dashboard! This is where you can see a high-level overview of your roster.',
      disableBeacon: true,
    },
    {
      target: '.sidebar-item:nth-child(2)',
      content: 'The Schedule tab is the heart of the app. It calculates exactly how many Mirror Dungeons you need to run to get your targeted IDs.',
      disableBeacon: true,
    },
    {
      target: '.sidebar-item:nth-child(3)',
      content: 'The Inventory tab tracks your Enkephalin, Shards, and Crates. Make sure to sync your Enkephalin here!',
      disableBeacon: true,
    },
    {
      target: '.sidebar-item:nth-child(4)',
      content: 'Your Wishlist! Any Identities or E.G.O you add to your Wishlist will automatically feed into the Schedule calculator.',
      disableBeacon: true,
    },
    {
      target: '.sidebar-item:nth-child(5)',
      content: 'And finally, the Databases. You can browse every Identity and E.G.O here, and mark them as Acquired as your roster grows.',
      disableBeacon: true,
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      setTutorialCompleted(true);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#1a1a1a',
          backgroundColor: '#1a1a1a',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          primaryColor: '#c9a84c',
          textColor: '#fff',
          width: 400,
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: '#c9a84c',
          color: '#000',
          fontWeight: 'bold'
        },
        buttonBack: {
          color: '#c9a84c'
        }
      }}
    />
  );
}
