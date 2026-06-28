// ============================================================
//  HA ENTITY CONFIGURATION
//  All entity IDs discovered from live HA instance 2026-06-21
//  Update this file when entities change.
// ============================================================

export const ENTITIES = {
  // ---------- Climate (AirTouch5 zones) ----------
  climate: {
    main:    'climate.ac_0',      // Main AC unit
    master:  'climate.master',
    kitchen: 'climate.kitchen',
    dining:  'climate.dining',
    tv_room: 'climate.tv_room',
    char:    'climate.char',
    ella:    'climate.ella',
    josh:    'climate.josh',
    study:   'climate.study',
  },

  // ---------- Lights (Shelly) ----------
  lights: {
    lounge:           'light.lounge_light_downlights',
    wall:             'light.wall_lights',
    kitchen:          'light.kitchen_light_downlights',
    kitchen_pendants: 'light.kitchen_light_pendants',
    dining:           'light.dining_lights',            // group
    dining_down:      'light.dining_light_downlights',
    dining_pendant:   'light.dining_light_pendant',
    hallway:          'light.hallway_light_downlights',
    piano_nook:       'light.hallway_light_piano_nook',
    tv_led:           'light.tv_led_strip',
    tv_wall:          'light.tv_wall_lights',
    pool:             'light.pool_light',
    pool_flood:       'light.pool_flood_light',
    alfresco:         'light.alfresco_downlight',
    garden:           'light.garden_lights',
    front_entry:      'light.outside_light_guest',
    clothesline:      'light.clothesline_light',
  },

  // ---------- Scenes ----------
  scenes: {
    good_night:   'scene.good_night',
    good_morning: 'scene.good_morning',
    dinner:       'scene.dinner',
    entertain:    'scene.entertain',
    movie:        'scene.movie',
    night_light:  'scene.night_light',
    daytime:      'scene.daytime',
  },

  // ---------- Covers ----------
  covers: {
    // Garage doors
    garage_chermside: 'cover.smart_garage_door_24070334243323610701c4e7ae05c55e_garage',
    garage_julia:     null,   // Julia St not yet installed

    // AirTouch5 dampers
    damper_master:  'cover.master_damper',
    damper_kitchen: 'cover.kitchen_damper',
    damper_dining:  'cover.dining_damper',
    damper_tv_room: 'cover.tv_room_damper',
    damper_char:    'cover.char_damper',
    damper_ella:    'cover.ella_damper',
    damper_josh:    'cover.josh_damper',
    damper_study:   'cover.study_damper',
  },

  // ---------- Binary sensors ----------
  pir: {
    kitchen: 'binary_sensor.kitchen_pir_sensor',
    piano:   'binary_sensor.piano_hall_pir_sensor',
    hallway: 'binary_sensor.back_hallway_pir_sensor',
  },

  // ---------- Cameras ----------
  cameras: {
    chermside: 'camera.chermside_st',   // unavailable until go2rtc configured
    julia:     'camera.julia_st',       // placeholder until go2rtc
    // UniFi G5 Bullets for Garage & Pool: add here after go2rtc setup
    garage:    null,
    pool:      null,
    indoor_1:  'camera.indoor_screen',
    indoor_2:  'camera.indoor_screen_2',
  },

  // ---------- Weather ----------
  weather: 'weather.forecast_home',

  // ---------- Alarm ----------
  // Inception integration not yet configured in HA
  alarm: null,

  // ---------- Energy (Sigenergy) ----------
  // Sigenergy not yet integrated — add entity IDs once connected
  energy: {
    solar_power:   null,  // sensor.sigenergy_solar_power (TBD)
    battery_soc:   null,  // sensor.sigenergy_battery_soc (TBD)
    battery_power: null,  // sensor.sigenergy_battery_power (TBD)
    grid_power:    null,  // sensor.sigenergy_grid_power (TBD)
    yield_today:   null,  // sensor.sigenergy_yield_today (TBD)
  },
}

// ---------- AirTouch5 Zone definitions ----------
export const ZONES = [
  { id: 'master',  name: 'Master',  entity: 'climate.master',  damper: 'cover.master_damper',  common: true },
  { id: 'kitchen', name: 'Kitchen', entity: 'climate.kitchen', damper: 'cover.kitchen_damper', common: true },
  { id: 'dining',  name: 'Dining',  entity: 'climate.dining',  damper: 'cover.dining_damper',  common: true },
  { id: 'tv_room', name: 'TV Room', entity: 'climate.tv_room', damper: 'cover.tv_room_damper', common: true },
  { id: 'char',    name: 'Char',    entity: 'climate.char',    damper: 'cover.char_damper',    common: false },
  { id: 'ella',    name: 'Ella',    entity: 'climate.ella',    damper: 'cover.ella_damper',    common: false },
  { id: 'josh',    name: 'Josh',    entity: 'climate.josh',    damper: 'cover.josh_damper',    common: false },
  { id: 'study',   name: 'Study',   entity: 'climate.study',   damper: 'cover.study_damper',   common: false },
]

// ---------- Scene definitions (for UI + scene button bar) ----------
export const SCENE_BUTTONS = [
  { id: 'good_night',   label: 'Good Night',   icon: 'moon',    entity: 'scene.good_night',   prominent: true },
  { id: 'good_morning', label: 'Good Morning', icon: 'sunrise', entity: 'scene.good_morning' },
  { id: 'dinner',       label: 'Dinner',       icon: 'utensils',entity: 'scene.dinner' },
  { id: 'entertain',    label: 'Entertain',    icon: 'music',   entity: 'scene.entertain' },
  { id: 'movie',        label: 'Movie',        icon: 'film',    entity: 'scene.movie' },
  { id: 'night_light',  label: 'Night Light',  icon: 'lamp',    entity: 'scene.night_light' },
]

// ---------- Room definitions (Rooms tab) ----------
export const ROOMS = [
  {
    id: 'lounge',
    name: 'Lounge',
    icon: 'sofa',
    color: '#ff8a3d',
    lights: ['light.lounge_light_downlights', 'light.wall_lights'],
    climate: null,
    devices: '2 lights',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: 'chef-hat',
    color: '#34d399',
    lights: ['light.kitchen_light_downlights', 'light.kitchen_light_pendants'],
    climate: 'climate.kitchen',
    devices: '2 lights · AC',
  },
  {
    id: 'master',
    name: 'Master Bed',
    icon: 'bed',
    color: '#a78bfa',
    lights: [],          // No bedroom lights connected yet
    climate: 'climate.master',
    devices: 'AC · no lights',
  },
  {
    id: 'dining',
    name: 'Dining',
    icon: 'utensils',
    color: '#38bdf8',
    lights: ['light.dining_lights'],
    climate: 'climate.dining',
    devices: '2 lights · AC',
  },
  {
    id: 'tvroom',
    name: 'TV Room',
    icon: 'tv',
    color: '#f5d04e',
    lights: ['light.tv_led_strip', 'light.tv_wall_lights'],
    climate: 'climate.tv_room',
    devices: '2 lights · AC',
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    icon: 'trees',
    color: '#6ee7b7',
    lights: ['light.pool_light', 'light.pool_flood_light', 'light.alfresco_downlight', 'light.garden_lights'],
    climate: null,
    devices: '4 lights',
  },
]
