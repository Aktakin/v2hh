/** Simulated attack catalog — fiction only. */

export const DOMAINS = [
  {
    id: 'wifi',
    name: 'Public Wi‑Fi',
    blurb: 'Air sniffing, auth attacks, evil twin, MitM, DoS, endpoint pivots.',
    tag: 'RF / LAN'
  },
  {
    id: 'email',
    name: 'Email phishing',
    blurb: 'Crafted mail, open/click rates, then exploit only clickers.',
    tag: 'Social'
  },
  {
    id: 'ble',
    name: 'Bluetooth / BLE',
    blurb: 'Nearby pairing abuse, spoofed peripherals, leaky beacons.',
    tag: 'RF'
  },
  {
    id: 'iot',
    name: 'IoT & printers',
    blurb: 'Default creds on cameras, TVs, printers — easy fish on the guest VLAN.',
    tag: 'LAN'
  },
  {
    id: 'social',
    name: 'Physical / social',
    blurb: 'Malicious QR, fake URL drops, juice-jacking kiosk sims.',
    tag: 'Human'
  },
  {
    id: 'enterprise',
    name: 'Enterprise edge',
    blurb: 'Guest 802.1X / rogue RADIUS theater, VPN portal clones.',
    tag: '802.1X'
  }
];

export const WIFI_VENUES = [
  { id: 'cafe', name: 'CafeFreeNet', place: 'Coffee shop', softBias: 0.65, encMix: ['OPEN', 'WPA2'] },
  { id: 'airport', name: 'SkyLink Free', place: 'Airport', softBias: 0.55, encMix: ['OPEN', 'WPA2'] },
  { id: 'hotel', name: 'GuestStay-WiFi', place: 'Hotel', softBias: 0.5, encMix: ['WPA2', 'WEP'] },
  { id: 'library', name: 'PublicLibraryNet', place: 'Library', softBias: 0.45, encMix: ['OPEN', 'WPA2'] },
  { id: 'mall', name: 'FoodCourt-Free', place: 'Mall', softBias: 0.7, encMix: ['OPEN'] },
  { id: 'cowork', name: 'DeskShare Open', place: 'Coworking', softBias: 0.35, encMix: ['WPA2', 'WPA2-ENT'] }
];

/**
 * Wi‑Fi techniques. `needs` = flags that must be true.
 * `gives` = flags set on success.
 * `category` groups the toolkit UI.
 */
export const WIFI_TECHNIQUES = [
  // Recon
  {
    id: 'monitor',
    category: 'Recon / Passive',
    name: 'Monitor mode sniffing',
    detail: 'Passive air capture — no TX. Baseline for everything else.',
    needs: [],
    gives: ['monitor'],
    risk: 'stealth',
    payout: 15,
    seconds: 2
  },
  {
    id: 'airodump',
    category: 'Recon / Passive',
    name: 'SSID / network discovery',
    detail: 'Map APs, clients, channels, encryption (airodump-style).',
    needs: ['monitor'],
    gives: ['map'],
    risk: 'stealth',
    payout: 25,
    seconds: 3
  },
  {
    id: 'pcap',
    category: 'Recon / Passive',
    name: 'Packet capture',
    detail: 'Collect ARP, DNS, HTTP plaintext, handshake candidates.',
    needs: ['monitor', 'map'],
    gives: ['pcap'],
    risk: 'stealth',
    payout: 30,
    seconds: 3
  },
  {
    id: 'profile',
    category: 'Recon / Passive',
    name: 'Client profiling',
    detail: 'MAC OUI, probe lists, traffic patterns → soft-target scores.',
    needs: ['map', 'pcap'],
    gives: ['profiles'],
    risk: 'stealth',
    payout: 35,
    seconds: 3
  },
  {
    id: 'passive_only',
    category: 'Evasion / Stealth',
    name: 'Passive-only recon mode',
    detail: 'Lock TX off. Undetectable sniffing; blocks active attacks until disabled.',
    needs: ['monitor'],
    gives: ['passiveOnly'],
    risk: 'stealth',
    payout: 10,
    seconds: 1
  },

  // Auth
  {
    id: 'wep',
    category: 'Access / Auth',
    name: 'WEP cracking (PTW)',
    detail: 'IV collection + PTW — beginner legacy win if WEP AP present.',
    needs: ['map', 'pcap'],
    gives: ['networkAccess', 'wepKey'],
    risk: 'active',
    payout: 80,
    seconds: 4,
    requiresEnc: 'WEP'
  },
  {
    id: 'handshake',
    category: 'Access / Auth',
    name: 'WPA/WPA2 handshake capture',
    detail: 'Deauth client → force reauth → capture handshake for wordlist crack.',
    needs: ['map', 'pcap'],
    gives: ['handshake'],
    risk: 'noisy',
    payout: 40,
    seconds: 4,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'crack_hs',
    category: 'Access / Auth',
    name: 'Dictionary crack handshake',
    detail: 'Classic small-fish wordlist against captured PSK handshake.',
    needs: ['handshake'],
    gives: ['networkAccess', 'psk'],
    risk: 'stealth',
    payout: 90,
    seconds: 5
  },
  {
    id: 'pmkid',
    category: 'Access / Auth',
    name: 'PMKID attack',
    detail: 'Pull PMKID from AP without a client handshake.',
    needs: ['map'],
    gives: ['pmkid', 'networkAccess'],
    risk: 'active',
    payout: 85,
    seconds: 4,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'wps',
    category: 'Access / Auth',
    name: 'WPS Pixie Dust / brute',
    detail: 'Attack WPS-enabled routers (simulated success if AP flagged).',
    needs: ['map'],
    gives: ['networkAccess', 'wps'],
    risk: 'noisy',
    payout: 70,
    seconds: 5,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'router_admin',
    category: 'Access / Auth',
    name: 'Router admin default creds',
    detail: 'Brute common admin panels once you can reach the gateway.',
    needs: ['networkAccess'],
    gives: ['routerAdmin'],
    risk: 'active',
    payout: 100,
    seconds: 4
  },
  {
    id: 'rogue_ap',
    category: 'Access / Auth',
    name: 'Rogue access point',
    detail: 'Stand up your own AP on a free channel.',
    needs: ['monitor'],
    gives: ['rogueAp'],
    risk: 'active',
    payout: 45,
    seconds: 3,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'evil_twin',
    category: 'Access / Auth',
    name: 'Evil twin',
    detail: 'Clone SSID, stronger beacon — harvest via fake portal.',
    needs: ['map', 'rogueAp'],
    gives: ['evilTwin', 'portal'],
    risk: 'noisy',
    payout: 60,
    seconds: 4,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'captive',
    category: 'Access / Auth',
    name: 'Captive portal phishing',
    detail: '“Free Wi‑Fi login” page — credential harvest on connect.',
    needs: ['evilTwin'],
    gives: ['portalCreds', 'clickedPool'],
    risk: 'active',
    payout: 75,
    seconds: 4
  },
  {
    id: 'karma',
    category: 'Access / Auth',
    name: 'Karma attack',
    detail: 'Answer preferred-network probes; devices auto-associate to you.',
    needs: ['rogueAp', 'profiles'],
    gives: ['karma', 'networkAccess'],
    risk: 'active',
    payout: 70,
    seconds: 4,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'enterprise_radius',
    category: 'Access / Auth',
    name: 'WPA-Enterprise rogue RADIUS',
    detail: 'Fake 802.1X authenticator — capture EAP creds (sim).',
    needs: ['map', 'rogueAp'],
    gives: ['radiusCreds', 'networkAccess'],
    risk: 'noisy',
    payout: 120,
    seconds: 5,
    requiresEnc: 'WPA2-ENT',
    blocksIf: ['passiveOnly']
  },

  // MitM
  {
    id: 'arp',
    category: 'MitM / Position',
    name: 'ARP spoofing',
    detail: 'Redirect LAN traffic through your host.',
    needs: ['networkAccess'],
    gives: ['mitm'],
    risk: 'noisy',
    payout: 55,
    seconds: 3
  },
  {
    id: 'dns_spoof',
    category: 'MitM / Position',
    name: 'DNS spoof / hijack',
    detail: 'Poison replies — send victims to fake sites.',
    needs: ['mitm'],
    gives: ['dnsHijack'],
    risk: 'noisy',
    payout: 65,
    seconds: 3
  },
  {
    id: 'sslstrip',
    category: 'MitM / Position',
    name: 'SSL stripping',
    detail: 'Downgrade HSTS-less HTTP targets to cleartext (sim).',
    needs: ['mitm'],
    gives: ['sslstrip'],
    risk: 'noisy',
    payout: 70,
    seconds: 4
  },
  {
    id: 'dhcp_spoof',
    category: 'MitM / Position',
    name: 'DHCP spoof / starvation',
    detail: 'Become gateway or exhaust the pool.',
    needs: ['networkAccess'],
    gives: ['mitm', 'dhcp'],
    risk: 'noisy',
    payout: 60,
    seconds: 4
  },
  {
    id: 'icmp_redirect',
    category: 'MitM / Position',
    name: 'ICMP redirect',
    detail: 'Manipulate host routing toward your box.',
    needs: ['networkAccess'],
    gives: ['mitm'],
    risk: 'active',
    payout: 50,
    seconds: 3
  },
  {
    id: 'session_hijack',
    category: 'MitM / Position',
    name: 'Session / cookie theft',
    detail: 'Lift tokens from cleartext or stripped sessions.',
    needs: ['mitm'],
    gives: ['cookies'],
    risk: 'active',
    payout: 95,
    seconds: 3
  },
  {
    id: 'inject',
    category: 'MitM / Position',
    name: 'Traffic manipulation',
    detail: 'Inject scripts/images into pages victims view.',
    needs: ['mitm', 'sslstrip'],
    gives: ['inject'],
    risk: 'noisy',
    payout: 80,
    seconds: 4
  },

  // DoS
  {
    id: 'deauth_flood',
    category: 'Denial of Service',
    name: 'Deauthentication flood',
    detail: 'Kick clients off — noisy, useful before handshake or evil twin.',
    needs: ['map'],
    gives: ['dos'],
    risk: 'loud',
    payout: 20,
    seconds: 2,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'beacon_flood',
    category: 'Denial of Service',
    name: 'Beacon flooding',
    detail: 'Flood fake SSIDs to confuse scanners / UX.',
    needs: ['monitor'],
    gives: ['dos'],
    risk: 'loud',
    payout: 15,
    seconds: 2,
    blocksIf: ['passiveOnly']
  },
  {
    id: 'jam',
    category: 'Denial of Service',
    name: 'Channel jamming (sim)',
    detail: 'Physical-layer DoS theater — burns stealth.',
    needs: ['monitor'],
    gives: ['dos'],
    risk: 'loud',
    payout: 10,
    seconds: 2,
    blocksIf: ['passiveOnly']
  },

  // Endpoint
  {
    id: 'nmap',
    category: 'Endpoint',
    name: 'Port scan clients',
    detail: 'nmap-style sweep of associated NPC devices.',
    needs: ['networkAccess', 'profiles'],
    gives: ['ports'],
    risk: 'active',
    payout: 40,
    seconds: 3
  },
  {
    id: 'smb',
    category: 'Endpoint',
    name: 'SMB / NetBIOS probe',
    detail: 'Hunt open file shares on soft laptops.',
    needs: ['ports'],
    gives: ['smb'],
    risk: 'noisy',
    payout: 85,
    seconds: 4
  },
  {
    id: 'browser_exploit',
    category: 'Endpoint',
    name: 'Browser drive-by (sim)',
    detail: 'Serve exploit kit via inject or DNS hijack.',
    needs: ['inject'],
    gives: ['browserHook'],
    risk: 'noisy',
    payout: 110,
    seconds: 4
  },
  {
    id: 'ble_side',
    category: 'Endpoint',
    name: 'Bluetooth / BLE side-channel',
    detail: 'While on Wi‑Fi, abuse nearby BLE pairing on phones.',
    needs: ['profiles'],
    gives: ['ble'],
    risk: 'active',
    payout: 55,
    seconds: 3
  },
  {
    id: 'iot',
    category: 'Endpoint',
    name: 'Printers / IoT default creds',
    detail: 'Cameras, TVs, printers on guest VLAN — easy fish.',
    needs: ['networkAccess'],
    gives: ['iot'],
    risk: 'active',
    payout: 75,
    seconds: 3
  },
  {
    id: 'qr_drop',
    category: 'Endpoint',
    name: 'Malicious QR / URL drop',
    detail: 'SE victims into your portal while co-located.',
    needs: ['portal'],
    gives: ['clickedPool'],
    risk: 'stealth',
    payout: 45,
    seconds: 2
  },
  {
    id: 'juice',
    category: 'Endpoint',
    name: 'Juice-jacking kiosk (sim)',
    detail: 'USB charge point steals data from desperate travelers.',
    needs: ['profiles'],
    gives: ['usb'],
    risk: 'active',
    payout: 65,
    seconds: 3
  },

  // Evasion
  {
    id: 'mac_spoof',
    category: 'Evasion / Stealth',
    name: 'MAC spoofing',
    detail: 'Clone a legit client — bypass naive MAC filters.',
    needs: ['profiles'],
    gives: ['macSpoof'],
    risk: 'stealth',
    payout: 30,
    seconds: 2
  },
  {
    id: 'throttle',
    category: 'Evasion / Stealth',
    name: 'Traffic throttle / shaping',
    detail: 'Stay under IDS volume thresholds while MitM’ing.',
    needs: ['mitm'],
    gives: ['throttle'],
    risk: 'stealth',
    payout: 25,
    seconds: 2
  }
];

export const EMAIL_VECTORS = [
  {
    id: 'captive',
    name: 'Fake Wi‑Fi portal mail',
    subject: 'Re-authenticate to stay online',
    body: 'Your session expires in 3 minutes.',
    cta: 'Continue'
  },
  {
    id: 'parcel',
    name: 'Missed delivery',
    subject: 'Package held — confirm address',
    body: 'Carrier could not deliver. Confirm within 24h.',
    cta: 'Reschedule'
  },
  {
    id: 'bank',
    name: 'Bank alert',
    subject: 'Unusual sign-in blocked',
    body: 'We paused a $214 transfer. Verify the device.',
    cta: 'Review activity'
  },
  {
    id: 'it',
    name: 'IT reset',
    subject: 'Mandatory password reset',
    body: 'Policy requires update before midnight.',
    cta: 'Reset password'
  }
];

export const BLE_TECHNIQUES = [
  { id: 'ble_scan', name: 'BLE advertise scan', detail: 'Map nearby phones, watches, buds.', needs: [], gives: ['bleMap'], payout: 20 },
  { id: 'ble_spoof', name: 'Spoof keyboard / headset', detail: 'Impersonate a paired peripheral.', needs: ['bleMap'], gives: ['bleSpoof'], payout: 55 },
  { id: 'ble_pair', name: 'Forced re-pair prompt', detail: 'Social-ish pairing spam → accept risk.', needs: ['bleSpoof'], gives: ['bleHook'], payout: 70 },
  { id: 'ble_leak', name: 'Beacon metadata leak', detail: 'Harvest names / manufacturer data.', needs: ['bleMap'], gives: ['bleLeak'], payout: 35 }
];

export const IOT_TECHNIQUES = [
  { id: 'iot_scan', name: 'Guest VLAN sweep', detail: 'Find printers, cams, smart TVs.', needs: [], gives: ['iotMap'], payout: 25 },
  { id: 'iot_default', name: 'Default credential spray', detail: 'admin/admin, admin/1234 theater.', needs: ['iotMap'], gives: ['iotAccess'], payout: 80 },
  { id: 'iot_cam', name: 'Open camera stream', detail: 'Unsecured RTSP/HTTP cams.', needs: ['iotAccess'], gives: ['iotCam'], payout: 90 },
  { id: 'iot_print', name: 'Print job intercept', detail: 'Capture docs on open print shares.', needs: ['iotMap'], gives: ['iotPrint'], payout: 60 }
];

export const SOCIAL_TECHNIQUES = [
  { id: 'qr', name: 'Malicious QR poster', detail: '“Scan for free Wi‑Fi” → your portal.', needs: [], gives: ['qrLive'], payout: 40 },
  { id: 'url_drop', name: 'URL drop / NFC tag', detail: 'Leave bait links in the venue.', needs: [], gives: ['urlDrop'], payout: 35 },
  { id: 'juice', name: 'Charge kiosk', detail: 'Juice-jacking USB theater.', needs: [], gives: ['juice'], payout: 65 },
  { id: 'shoulder', name: 'Shoulder-surf PIN (sim)', detail: 'Observe soft targets at the counter.', needs: [], gives: ['pin'], payout: 30 }
];

export const ENTERPRISE_TECHNIQUES = [
  { id: 'ent_scan', name: 'Discover 802.1X SSID', detail: 'Find corp/guest enterprise beacons.', needs: [], gives: ['entMap'], payout: 30 },
  { id: 'ent_rogue', name: 'Rogue RADIUS', detail: 'Evil twin + fake authenticator.', needs: ['entMap'], gives: ['entRadius'], payout: 100 },
  { id: 'ent_portal', name: 'VPN portal clone', detail: 'Harvest corp VPN logins.', needs: ['entMap'], gives: ['entVpn'], payout: 110 },
  { id: 'ent_relay', name: 'Credential relay (sim)', detail: 'Relay captured EAP toward payout.', needs: ['entRadius'], gives: ['entRelay'], payout: 130 }
];

export function groupByCategory(techniques) {
  const map = new Map();
  techniques.forEach((t) => {
    const key = t.category || 'General';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  });
  return [...map.entries()];
}
