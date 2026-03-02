"use client";

import React from "react";
import StarterPackCompletion from "../StarterPackCompletion";

export default function DemoPage() {
  const demoValues = {
    grounding_threeWords: 'Curious, hopeful, grounded',
    grounding_connected: 'This morning during meditation',
    grounding_release: 'The need for perfection',
    grounding_statement: 'Today, I choose to embrace my authentic journey',
    vision_12months: 'Launching my creative business while maintaining balance with family',
    vision_boldest: 'Building a community that empowers others to discover their purpose',
    vision_inspires: 'Marie Forleo - her energy and commitment to growth inspire me daily',
    vision_desire1: 'Creative freedom',
    vision_desire2: 'Financial abundance',
    vision_desire3: 'Deep meaningful connections',
    selfDiscovery_patterns: 'I tend to overcommit when something excites me',
    selfDiscovery_outOfAlignment: 'When I neglect my own needs while helping others',
    selfDiscovery_smallStep: 'Setting boundaries on my availability',
    selfDiscovery_statement: 'I am most myself when I am creating and connecting authentically with others',
    coreValues_alive: 'Writing, creating, having meaningful conversations',
    coreValues_advice: 'People seek me out for guidance on clarity and life direction',
    coreValues_three: 'Growth, Creativity, Connection',
    coreValues_reflection: 'I honor Growth through continuous learning, Creativity through daily practices, Connection through vulnerable conversations.',
    energy_gives: 'Creative work, meaningful conversations, time in nature',
    energy_drains: 'Administrative tasks, unnecessary meetings, disconnection from purpose',
    energy_peak: 'Most productive early morning, most creative during afternoon transitions',
    energy_schedule: 'Morning: Focus-Deep work/Creation, Rest-Meditation\nAfternoon: Focus-Meetings/Collaboration, Rest-Walking\nEvening: Focus-Reading/Learning, Rest-Reflection',
    purpose_group: 'Entrepreneurs and creators who feel lost in their journey',
    purpose_message: 'Your clarity is your superpower - stop waiting to feel ready',
    purpose_legacy: 'A community of people living in alignment with their authentic purpose',
    purpose_statement: 'My purpose is to empower entrepreneurs to discover their authentic path so that they build businesses rooted in clarity and meaning',
    integration_surprise: 'How deeply my energy patterns connect to my values and purpose',
    integration_clarity: 'The purpose statement exercise - it crystallized everything',
    integration_bravestep: 'Sharing my vision publicly and starting my coaching practice',
    integration_commitment: 'I commit to living in alignment with my purpose, even in small daily choices. I will honor my energy patterns, speak my truth, and build the community I envision.',
  };

  return (
    <StarterPackCompletion 
      userName="Demo User" 
      values={demoValues} 
      completionDate={new Date()}
    />
  );
}
