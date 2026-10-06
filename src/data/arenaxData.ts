import { Player, Achievement, ApiEndpoint, InterviewTopic } from '../types/arenax';
import { INITIAL_DAILY_MISSIONS } from './heroesData';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    code: 'FIRST_BLOOD_WIN',
    name: 'First Victory',
    description: 'Win your very first battle in the ArenaX battleground.',
    condition: 'wins >= 1',
    reward_coins: 100,
    reward_xp: 250,
    icon: 'Trophy',
  },
  {
    id: 2,
    code: 'WARRIOR_TEN',
    name: 'Gladiator of Ten',
    description: 'Achieve 10 registered competitive match wins.',
    condition: 'wins >= 10',
    reward_coins: 500,
    reward_xp: 1200,
    icon: 'Swords',
  },
  {
    id: 3,
    code: 'ELITE_1500',
    name: 'Elite Contender',
    description: 'Cross the 1500 ELO rating threshold in ranked arena.',
    condition: 'elo_rating >= 1500',
    reward_coins: 1000,
    reward_xp: 3000,
    icon: 'Crown',
  },
  {
    id: 4,
    code: 'KILLSTREAK_MASTER',
    name: 'Apex Slayer',
    description: 'Eliminate 30 opponents across ranked engagements.',
    condition: 'kills >= 30',
    reward_coins: 750,
    reward_xp: 2000,
    icon: 'Target',
  },
  {
    id: 5,
    code: 'CENTURY_VETERAN',
    name: 'Arena Veteran',
    description: 'Complete 50 competitive battle sessions.',
    condition: 'matches_played >= 50',
    reward_coins: 1500,
    reward_xp: 5000,
    icon: 'ShieldAlert',
  },
];

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 1,
    username: 'Piyush',
    email: 'piyush@arenax.gg',
    elo_rating: 1425,
    level: 12,
    experience: 8750,
    coins: 1650,
    role: 'PLAYER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    created_at: '2026-08-12T10:30:00Z',
    selectedHeroId: 'PIYUSH',
    winStreak: 6,
    bestStreak: 12,
    equippedTitle: '👑 TACTICAL WARRIOR',
    equippedFrame: 'Cyber Gold',
    unlockedTitles: ['👑 TACTICAL WARRIOR', '🔥 APEX SLAYER', '⚡ ARENA LEGEND'],
    unlockedFrames: ['Cyber Gold', 'Neon Cyan', 'Crimson Edge'],
    dailyMissions: INITIAL_DAILY_MISSIONS,
    missionsRewardClaimed: false,
    stats: {
      id: 1,
      player_id: 1,
      matches_played: 38,
      wins: 27,
      losses: 11,
      kills: 92,
      deaths: 28,
      win_rate: 71.0,
      kd_ratio: 3.28,
    },
    inventory: [
      { id: 101, item_name: 'Vortex Broadsword', category: 'WEAPON', rarity: 'EPIC', quantity: 1, acquired_at: '2026-08-20' },
      { id: 102, item_name: 'Aegis Energy Shield', category: 'SHIELD', rarity: 'RARE', quantity: 1, acquired_at: '2026-08-22' },
      { id: 103, item_name: 'Cyber Samurai Skin', category: 'SKIN', rarity: 'LEGENDARY', quantity: 1, acquired_at: '2026-09-01' },
      { id: 104, item_name: 'High-Rank Combat Badge', category: 'BADGE', rarity: 'EPIC', quantity: 1, acquired_at: '2026-09-10' },
    ],
    achievements: [
      { achievement_id: 1, unlocked_at: '2026-08-12T14:10:00Z' },
      { achievement_id: 2, unlocked_at: '2026-08-28T18:45:00Z' },
    ],
  },
  {
    id: 2,
    username: 'Rahul',
    email: 'rahul@arenax.gg',
    elo_rating: 1185,
    level: 5,
    experience: 2120,
    coins: 720,
    role: 'PLAYER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-08-14T11:00:00Z',
    selectedHeroId: 'SHADOW',
    winStreak: 2,
    bestStreak: 4,
    equippedTitle: '⚡ SPEED DEMON',
    equippedFrame: 'Neon Cyan',
    unlockedTitles: ['⚡ SPEED DEMON'],
    unlockedFrames: ['Neon Cyan'],
    dailyMissions: INITIAL_DAILY_MISSIONS,
    missionsRewardClaimed: false,
    stats: {
      id: 2,
      player_id: 2,
      matches_played: 22,
      wins: 14,
      losses: 8,
      kills: 44,
      deaths: 26,
      win_rate: 63.6,
      kd_ratio: 1.69,
    },
    inventory: [
      { id: 105, item_name: 'Plasma Katana', category: 'WEAPON', rarity: 'EPIC', quantity: 1, acquired_at: '2026-08-25' },
      { id: 106, item_name: 'Titan Titanium Vest', category: 'SHIELD', rarity: 'RARE', quantity: 1, acquired_at: '2026-09-02' },
    ],
    achievements: [
      { achievement_id: 1, unlocked_at: '2026-08-14T15:30:00Z' },
      { achievement_id: 2, unlocked_at: '2026-08-30T20:10:00Z' },
    ],
  },
  {
    id: 3,
    username: 'Aman',
    email: 'aman@arenax.gg',
    elo_rating: 1820,
    level: 18,
    experience: 8900,
    coins: 2450,
    role: 'PLAYER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-07-28T09:15:00Z',
    selectedHeroId: 'VOLT',
    winStreak: 6,
    bestStreak: 8,
    equippedTitle: '💀 UNSTOPPABLE',
    equippedFrame: 'Obsidian Dragon',
    unlockedTitles: ['👑 CHAMPION', '💀 UNSTOPPABLE'],
    unlockedFrames: ['Cyber Gold', 'Obsidian Dragon'],
    dailyMissions: INITIAL_DAILY_MISSIONS,
    missionsRewardClaimed: true,
    stats: {
      id: 3,
      player_id: 3,
      matches_played: 68,
      wins: 49,
      losses: 19,
      kills: 142,
      deaths: 51,
      win_rate: 72.1,
      kd_ratio: 2.78,
    },
    inventory: [
      { id: 107, item_name: 'Doomsday Railgun', category: 'WEAPON', rarity: 'LEGENDARY', quantity: 1, acquired_at: '2026-08-10' },
      { id: 108, item_name: 'Quantum Distortion Field', category: 'SHIELD', rarity: 'LEGENDARY', quantity: 1, acquired_at: '2026-08-15' },
    ],
    achievements: [
      { achievement_id: 1, unlocked_at: '2026-07-28T10:00:00Z' },
      { achievement_id: 2, unlocked_at: '2026-08-05T12:00:00Z' },
      { achievement_id: 3, unlocked_at: '2026-08-19T17:00:00Z' },
      { achievement_id: 4, unlocked_at: '2026-08-25T14:30:00Z' },
      { achievement_id: 5, unlocked_at: '2026-09-18T16:45:00Z' },
    ],
  },
  {
    id: 4,
    username: 'Anya_Viper',
    email: 'anya@arenax.gg',
    elo_rating: 1525,
    level: 15,
    experience: 6400,
    coins: 1600,
    role: 'PLAYER',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-08-01T14:20:00Z',
    selectedHeroId: 'SHADOW',
    winStreak: 3,
    bestStreak: 5,
    equippedTitle: '🔥 WINNER',
    equippedFrame: 'Neon Cyan',
    unlockedTitles: ['🔥 WINNER'],
    unlockedFrames: ['Neon Cyan'],
    dailyMissions: INITIAL_DAILY_MISSIONS,
    missionsRewardClaimed: false,
    stats: {
      id: 4,
      player_id: 4,
      matches_played: 45,
      wins: 29,
      losses: 16,
      kills: 95,
      deaths: 42,
      win_rate: 64.4,
      kd_ratio: 2.26,
    },
    inventory: [
      { id: 109, item_name: 'Venom Dual Blades', category: 'WEAPON', rarity: 'EPIC', quantity: 1, acquired_at: '2026-08-15' },
    ],
    achievements: [
      { achievement_id: 1, unlocked_at: '2026-08-01T16:00:00Z' },
      { achievement_id: 2, unlocked_at: '2026-08-18T19:20:00Z' },
      { achievement_id: 3, unlocked_at: '2026-09-02T13:40:00Z' },
      { achievement_id: 4, unlocked_at: '2026-09-14T20:10:00Z' },
    ],
  },
  {
    id: 5,
    username: 'Viktor_K',
    email: 'viktor@arenax.gg',
    elo_rating: 1390,
    level: 11,
    experience: 3950,
    coins: 980,
    role: 'PLAYER',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-08-20T17:40:00Z',
    selectedHeroId: 'TITAN',
    winStreak: 1,
    bestStreak: 3,
    equippedTitle: '🛡️ IRONCLAD',
    equippedFrame: 'Cyber Gold',
    unlockedTitles: ['🛡️ IRONCLAD'],
    unlockedFrames: ['Cyber Gold'],
    dailyMissions: INITIAL_DAILY_MISSIONS,
    missionsRewardClaimed: false,
    stats: {
      id: 5,
      player_id: 5,
      matches_played: 29,
      wins: 15,
      losses: 14,
      kills: 49,
      deaths: 38,
      win_rate: 51.7,
      kd_ratio: 1.28,
    },
    inventory: [
      { id: 110, item_name: 'Heavy War Hammer', category: 'WEAPON', rarity: 'RARE', quantity: 1, acquired_at: '2026-08-25' },
    ],
    achievements: [
      { achievement_id: 1, unlocked_at: '2026-08-20T19:00:00Z' },
      { achievement_id: 2, unlocked_at: '2026-09-12T16:30:00Z' },
    ],
  },
  {
    id: 6,
    username: 'Elena_Frost',
    email: 'elena@arenax.gg',
    elo_rating: 1740,
    level: 19,
    experience: 9800,
    coins: 3100,
    role: 'PLAYER',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-07-15T08:00:00Z',
    selectedHeroId: 'VOLT',
    winStreak: 5,
    bestStreak: 7,
    equippedTitle: '👑 CHAMPION',
    equippedFrame: 'Prismatic Master',
    unlockedTitles: ['👑 CHAMPION', '⚡ SPEED DEMON'],
    unlockedFrames: ['Prismatic Master'],
    dailyMissions: INITIAL_DAILY_MISSIONS,
    missionsRewardClaimed: true,
    stats: {
      id: 6,
      player_id: 6,
      matches_played: 76,
      wins: 56,
      losses: 20,
      kills: 168,
      deaths: 58,
      win_rate: 73.7,
      kd_ratio: 2.89,
    },
    inventory: [
      { id: 111, item_name: 'Cryo Sniper Rifle', category: 'WEAPON', rarity: 'LEGENDARY', quantity: 1, acquired_at: '2026-08-01' },
      { id: 112, item_name: 'Frost Armor Mk IV', category: 'SKIN', rarity: 'LEGENDARY', quantity: 1, acquired_at: '2026-08-10' },
    ],
    achievements: [
      { achievement_id: 1, unlocked_at: '2026-07-15T11:00:00Z' },
      { achievement_id: 2, unlocked_at: '2026-07-29T14:20:00Z' },
      { achievement_id: 3, unlocked_at: '2026-08-11T18:10:00Z' },
      { achievement_id: 4, unlocked_at: '2026-08-28T22:00:00Z' },
      { achievement_id: 5, unlocked_at: '2026-09-24T19:30:00Z' },
    ],
  },
  {
    id: 7,
    username: 'SysAdmin',
    email: 'admin@arenax.gg',
    elo_rating: 1920,
    level: 25,
    experience: 18000,
    coins: 9999,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-06-01T00:00:00Z',
    selectedHeroId: 'TITAN',
    winStreak: 8,
    bestStreak: 12,
    equippedTitle: '💀 UNSTOPPABLE',
    equippedFrame: 'Prismatic Master',
    unlockedTitles: ['👑 CHAMPION', '💀 UNSTOPPABLE', '🛡️ IRONCLAD'],
    unlockedFrames: ['Cyber Gold', 'Obsidian Dragon', 'Prismatic Master'],
    dailyMissions: INITIAL_DAILY_MISSIONS,
    missionsRewardClaimed: true,
    stats: {
      id: 7,
      player_id: 7,
      matches_played: 110,
      wins: 89,
      losses: 21,
      kills: 280,
      deaths: 72,
      win_rate: 80.9,
      kd_ratio: 3.88,
    },
    inventory: [
      { id: 113, item_name: 'Staff of the Architect', category: 'WEAPON', rarity: 'LEGENDARY', quantity: 1, acquired_at: '2026-06-01' },
    ],
    achievements: [
      { achievement_id: 1, unlocked_at: '2026-06-01T01:00:00Z' },
      { achievement_id: 2, unlocked_at: '2026-06-10T12:00:00Z' },
      { achievement_id: 3, unlocked_at: '2026-06-25T15:00:00Z' },
      { achievement_id: 4, unlocked_at: '2026-07-10T19:00:00Z' },
      { achievement_id: 5, unlocked_at: '2026-08-01T20:00:00Z' },
    ],
  },
];

export const ALL_API_ENDPOINTS: ApiEndpoint[] = [
  // Authentication APIs
  {
    id: 'auth-register',
    method: 'POST',
    path: '/api/register/',
    name: 'Player Registration',
    category: 'Authentication',
    description: 'Registers a new player, creates Player model and initial 1000 ELO PlayerStats record atomically.',
    requiresAuth: false,
    defaultPayload: {
      username: 'Dev_Shadow',
      email: 'dev@arenax.gg',
      password: 'SecurePass_2026!',
    },
    drfView: 'RegisterView(APIView)',
    drfSerializer: 'RegisterSerializer(serializers.ModelSerializer)',
    drfCodeSnippet: `class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = User.objects.create_user(**serializer.validated_data)
            player = Player.objects.create(user=user, username=user.username, email=user.email, elo_rating=1000)
            PlayerStats.objects.create(player=player)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh), "player_id": player.id}, status=201)`,
  },
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/login/',
    name: 'Player JWT Login',
    category: 'Authentication',
    description: 'Authenticates credentials, generates 15-minute access token and 7-day refresh token.',
    requiresAuth: false,
    defaultPayload: {
      username: 'Piyush',
      password: 'password123',
    },
    drfView: 'TokenObtainPairView / CustomLoginView',
    drfSerializer: 'CustomTokenObtainPairSerializer',
    drfCodeSnippet: `class CustomLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
        if not user:
            return Response({"error": "Invalid credentials provided."}, status=401)
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "player": PlayerSerializer(user.player).data
        })`,
  },
  {
    id: 'auth-refresh',
    method: 'POST',
    path: '/api/token/refresh/',
    name: 'JWT Token Refresh',
    category: 'Authentication',
    description: 'Refreshes an expired short-lived access token using valid refresh token without re-login.',
    requiresAuth: false,
    defaultPayload: {
      refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwZSI6InJlZnJlc2gifQ...',
    },
    drfView: 'TokenRefreshView',
    drfSerializer: 'TokenRefreshSerializer',
    drfCodeSnippet: `class CustomTokenRefreshView(TokenRefreshView):
    # DRF simplejwt built-in view verifying HMAC-SHA256 signature
    # Validates expiry and blacklist before returning fresh access token
    pass`,
  },

  // Player APIs
  {
    id: 'player-me',
    method: 'GET',
    path: '/api/players/me/',
    name: 'Get Current Profile',
    category: 'Player Profile',
    description: 'Fetches authenticated player profile, rating, stats and equipped items using select_related.',
    requiresAuth: true,
    drfView: 'PlayerProfileView(APIView)',
    drfSerializer: 'PlayerDetailSerializer',
    drfCodeSnippet: `class PlayerProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Optimization: select_related fetches 1:1 stats in 1 SQL query
        player = Player.objects.select_related('stats').prefetch_related('inventory').get(user=request.user)
        return Response(PlayerDetailSerializer(player).data)`,
  },
  {
    id: 'player-detail',
    method: 'GET',
    path: '/api/players/2/',
    name: 'Get Player By ID',
    category: 'Player Profile',
    description: 'Public profile lookup by player ID for inspecting rival statistics and win rates.',
    requiresAuth: true,
    drfView: 'PlayerDetailView(RetrieveAPIView)',
    drfSerializer: 'PlayerPublicSerializer',
    drfCodeSnippet: `class PlayerDetailView(RetrieveAPIView):
    queryset = Player.objects.select_related('stats')
    serializer_class = PlayerPublicSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'`,
  },
  {
    id: 'player-update-me',
    method: 'PUT',
    path: '/api/players/me/',
    name: 'Update Player Profile',
    category: 'Player Profile',
    description: 'Updates mutable fields (e.g., custom handle bio, active title avatar).',
    requiresAuth: true,
    defaultPayload: {
      email: 'piyush.pro@arenax.gg',
    },
    drfView: 'PlayerProfileView.put',
    drfSerializer: 'PlayerUpdateSerializer',
    drfCodeSnippet: `def put(self, request):
    player = request.user.player
    serializer = PlayerUpdateSerializer(player, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)`,
  },

  // Matchmaking APIs
  {
    id: 'mm-join',
    method: 'POST',
    path: '/api/matchmaking/join/',
    name: 'Join Matchmaking Queue',
    category: 'Matchmaking',
    description: 'Inserts player into matchmaking queue and initiates dynamic ELO window search (±100).',
    requiresAuth: true,
    defaultPayload: {
      game_mode: '1v1_RANKED',
    },
    drfView: 'JoinQueueView(APIView)',
    drfSerializer: 'QueueRequestSerializer',
    drfCodeSnippet: `class JoinQueueView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        player = request.user.player
        service = MatchmakingService()
        queue_entry = service.enqueue_player(player)
        match = service.try_match_player(queue_entry)
        if match:
            return Response({"status": "MATCHED", "game_session_id": match.id}, status=201)
        return Response({"status": "QUEUED", "current_range": 100, "elo": player.elo_rating})`,
  },
  {
    id: 'mm-leave',
    method: 'DELETE',
    path: '/api/matchmaking/leave/',
    name: 'Leave Matchmaking Queue',
    category: 'Matchmaking',
    description: 'Removes player from waiting matchmaking pool when cancelled.',
    requiresAuth: true,
    drfView: 'LeaveQueueView(APIView)',
    drfSerializer: 'None',
    drfCodeSnippet: `class LeaveQueueView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request):
        deleted, _ = MatchQueue.objects.filter(player=request.user.player, status='WAITING').delete()
        return Response({"success": bool(deleted), "message": "Removed from queue."})`,
  },
  {
    id: 'mm-status',
    method: 'GET',
    path: '/api/matchmaking/status/',
    name: 'Poll Matchmaking Status',
    category: 'Matchmaking',
    description: 'Checks whether current player has been matched, window expansion state and elapsed time.',
    requiresAuth: true,
    drfView: 'QueueStatusView(APIView)',
    drfSerializer: 'QueueStatusSerializer',
    drfCodeSnippet: `class QueueStatusView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        entry = MatchQueue.objects.filter(player=request.user.player).first()
        if not entry:
            return Response({"status": "IDLE"})
        return Response({
            "status": entry.status,
            "seconds_in_queue": (timezone.now() - entry.joined_at).seconds,
            "current_range": entry.current_range,
            "session_id": entry.game_session_id
        })`,
  },

  // Game Session APIs
  {
    id: 'games-create',
    method: 'POST',
    path: '/api/games/',
    name: 'Create Game Session (Admin/System)',
    category: 'Game Sessions',
    description: 'Internal service creates active battle session for matched participants with secure session tokens.',
    requiresAuth: true,
    defaultPayload: {
      player_a_id: 1,
      player_b_id: 2,
      map_name: 'Cyber_Colosseum_01',
    },
    drfView: 'CreateGameSessionView(CreateAPIView)',
    drfSerializer: 'GameSessionCreateSerializer',
    drfCodeSnippet: `class CreateGameSessionView(CreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = GameSessionCreateSerializer`,
  },
  {
    id: 'games-detail',
    method: 'GET',
    path: '/api/games/101/',
    name: 'Get Game Session Info',
    category: 'Game Sessions',
    description: 'Fetches live state of active match session, connected players and initial ELO snapshot.',
    requiresAuth: true,
    drfView: 'GameSessionDetailView(RetrieveAPIView)',
    drfSerializer: 'GameSessionDetailSerializer',
    drfCodeSnippet: `class GameSessionDetailView(RetrieveAPIView):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionDetailSerializer
    permission_classes = [IsAuthenticated]`,
  },
  {
    id: 'games-result',
    method: 'POST',
    path: '/api/games/101/result/',
    name: 'Submit Match Result (Atomic Transaction)',
    category: 'Game Sessions',
    description: 'Processes game outcome, computes ELO delta with K=32, updates stats, triggers achievements inside transaction.atomic.',
    requiresAuth: true,
    defaultPayload: {
      winner_id: 1,
      player_a_kills: 4,
      player_b_kills: 2,
    },
    drfView: 'SubmitMatchResultView(APIView)',
    drfSerializer: 'MatchResultInputSerializer',
    drfCodeSnippet: `class SubmitMatchResultView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        service = MatchService()
        with transaction.atomic():
            result = service.complete_match(
                session_id=pk,
                winner_id=request.data.get('winner_id'),
                kills_a=request.data.get('player_a_kills', 0),
                kills_b=request.data.get('player_b_kills', 0)
            )
        return Response(result, status=200)`,
  },

  // Leaderboard APIs
  {
    id: 'leaderboard-all',
    method: 'GET',
    path: '/api/leaderboard/',
    name: 'Get Paginated Leaderboard',
    category: 'Leaderboard',
    description: 'Retrieves global rankings ordered by elo_rating DESC with indexed B-Tree scanning.',
    requiresAuth: false,
    drfView: 'LeaderboardView(ListAPIView)',
    drfSerializer: 'LeaderboardSerializer',
    drfCodeSnippet: `class LeaderboardView(ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    serializer_class = LeaderboardSerializer
    def get_queryset(self):
        # Uses models.Index(fields=['-elo_rating'])
        return Player.objects.select_related('stats').order_by('-elo_rating')`,
  },
  {
    id: 'leaderboard-top',
    method: 'GET',
    path: '/api/leaderboard/top/',
    name: 'Get Top 10 Hall of Fame',
    category: 'Leaderboard',
    description: 'Fetches cached top 10 apex gladiators for lobby billboard display.',
    requiresAuth: false,
    drfView: 'TopLeaderboardView(APIView)',
    drfSerializer: 'LeaderboardSerializer',
    drfCodeSnippet: `class TopLeaderboardView(APIView):
    def get(self, request):
        top_players = cache.get('top_10_leaderboard')
        if not top_players:
            qs = Player.objects.select_related('stats').order_by('-elo_rating')[:10]
            top_players = LeaderboardSerializer(qs, many=True).data
            cache.set('top_10_leaderboard', top_players, timeout=30) # 30s cache
        return Response(top_players)`,
  },

  // Rewards APIs
  {
    id: 'rewards-list',
    method: 'GET',
    path: '/api/rewards/',
    name: 'Get Available Rewards',
    category: 'Rewards',
    description: 'Lists all progression rewards, milestones and seasonal unlockable cosmetics.',
    requiresAuth: true,
    drfView: 'RewardListView(ListAPIView)',
    drfSerializer: 'RewardSerializer',
    drfCodeSnippet: `class RewardListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer`,
  },
  {
    id: 'rewards-claim',
    method: 'POST',
    path: '/api/rewards/claim/',
    name: 'Claim Reward by ID',
    category: 'Rewards',
    description: 'Claims milestone reward and grants coins/XP/item to inventory with duplicate claim protection.',
    requiresAuth: true,
    defaultPayload: {
      reward_id: 1,
    },
    drfView: 'ClaimRewardView(APIView)',
    drfSerializer: 'ClaimRewardSerializer',
    drfCodeSnippet: `class ClaimRewardView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        service = RewardService()
        reward = service.claim_reward(player=request.user.player, reward_id=request.data.get('reward_id'))
        return Response({"status": "CLAIMED", "reward": reward.title})`,
  },

  // Achievements APIs
  {
    id: 'achievements-all',
    method: 'GET',
    path: '/api/achievements/',
    name: 'Get All Achievements Catalog',
    category: 'Achievements',
    description: 'Catalog of all unlockable badges, criteria conditions, and rewards.',
    requiresAuth: false,
    drfView: 'AchievementListView(ListAPIView)',
    drfSerializer: 'AchievementSerializer',
    drfCodeSnippet: `class AchievementListView(ListAPIView):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer`,
  },
  {
    id: 'achievements-me',
    method: 'GET',
    path: '/api/achievements/me/',
    name: 'Get My Unlocked Achievements',
    category: 'Achievements',
    description: 'Lists all achievements unlocked by authenticated player with timestamps.',
    requiresAuth: true,
    drfView: 'PlayerAchievementsView(APIView)',
    drfSerializer: 'PlayerAchievementDetailSerializer',
    drfCodeSnippet: `class PlayerAchievementsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        qs = PlayerAchievement.objects.filter(player=request.user.player).select_related('achievement')
        return Response(PlayerAchievementDetailSerializer(qs, many=True).data)`,
  },

  // Match History APIs
  {
    id: 'matches-history',
    method: 'GET',
    path: '/api/matches/history/',
    name: 'Get Player Match History',
    category: 'Match History',
    description: 'Returns historical match timeline for current player including ELO before/after and K/D.',
    requiresAuth: true,
    drfView: 'MatchHistoryView(ListAPIView)',
    drfSerializer: 'MatchHistorySerializer',
    drfCodeSnippet: `class MatchHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchHistorySerializer
    def get_queryset(self):
        return MatchHistory.objects.filter(player=request.user.player).order_by('-played_at')[:20]`,
  },
  {
    id: 'matches-detail',
    method: 'GET',
    path: '/api/matches/101/',
    name: 'Get Match Detail Telemetry',
    category: 'Match History',
    description: 'Deep breakdown of individual match outcome: participants, rounds, ELO calculations and timeline.',
    requiresAuth: true,
    drfView: 'MatchDetailView(RetrieveAPIView)',
    drfSerializer: 'MatchDetailSerializer',
    drfCodeSnippet: `class MatchDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Match.objects.select_related('game_session').prefetch_related('participants')
    serializer_class = MatchDetailSerializer`,
  },
];

export const MYSQL_TABLE_SCHEMAS = [
  {
    table_name: 'players',
    django_model: 'Player',
    purpose: 'Core player entity and authentication link',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'user_id', type: 'INT', key: 'FK -> auth_user.id', extra: 'UNIQUE' },
      { name: 'username', type: 'VARCHAR(100)', key: 'UNIQUE, INDEX', extra: 'NOT NULL' },
      { name: 'email', type: 'VARCHAR(254)', key: 'UNIQUE', extra: 'NOT NULL' },
      { name: 'elo_rating', type: 'INT', key: 'INDEX (idx_elo_desc)', extra: 'DEFAULT 1000' },
      { name: 'level', type: 'INT', key: '', extra: 'DEFAULT 1' },
      { name: 'experience', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'role', type: 'VARCHAR(20)', key: '', extra: "DEFAULT 'PLAYER'" },
      { name: 'created_at', type: 'DATETIME(6)', key: '', extra: 'CURRENT_TIMESTAMP' },
    ],
    indexes: ['PRIMARY (id)', 'UNIQUE KEY uk_username (username)', 'UNIQUE KEY uk_email (email)', 'KEY idx_elo_desc (elo_rating DESC)'],
    django_code: `class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player')
    username = models.CharField(max_length=100, unique=True, db_index=True)
    email = models.EmailField(unique=True)
    elo_rating = models.IntegerField(default=1000)
    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)
    role = models.CharField(max_length=20, default='PLAYER')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'players'
        indexes = [
            models.Index(fields=['-elo_rating'], name='idx_elo_desc'),
        ]`,
  },
  {
    table_name: 'player_stats',
    django_model: 'PlayerStats',
    purpose: 'Modular 1:1 statistics isolated from identity profile',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'player_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'UNIQUE, NOT NULL' },
      { name: 'matches_played', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'wins', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'losses', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'kills', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'deaths', type: 'INT', key: '', extra: 'DEFAULT 0' },
    ],
    indexes: ['PRIMARY (id)', 'UNIQUE KEY uk_player_stats (player_id)'],
    django_code: `class PlayerStats(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='stats')
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    kills = models.IntegerField(default=0)
    deaths = models.IntegerField(default=0)

    @property
    def win_rate(self):
        return (self.wins / self.matches_played * 100) if self.matches_played > 0 else 0.0`,
  },
  {
    table_name: 'game_sessions',
    django_model: 'GameSession',
    purpose: 'Represents live running battle instances and states',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'session_token', type: 'VARCHAR(64)', key: 'UNIQUE', extra: 'NOT NULL' },
      { name: 'status', type: "ENUM('WAITING','ACTIVE','COMPLETED')", key: 'INDEX', extra: "DEFAULT 'WAITING'" },
      { name: 'map_name', type: 'VARCHAR(100)', key: '', extra: 'NOT NULL' },
      { name: 'player_a_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'NOT NULL' },
      { name: 'player_b_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'NOT NULL' },
      { name: 'winner_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'NULLABLE' },
      { name: 'started_at', type: 'DATETIME(6)', key: '', extra: 'NULLABLE' },
      { name: 'ended_at', type: 'DATETIME(6)', key: '', extra: 'NULLABLE' },
    ],
    indexes: ['PRIMARY (id)', 'KEY idx_session_status (status)', 'KEY idx_player_a (player_a_id)', 'KEY idx_player_b (player_b_id)'],
    django_code: `class GameSession(models.Model):
    STATUS_CHOICES = [('WAITING', 'Waiting'), ('ACTIVE', 'Active'), ('COMPLETED', 'Completed')]
    session_token = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WAITING')
    map_name = models.CharField(max_length=100)
    player_a = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sessions_as_a')
    player_b = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sessions_as_b')
    winner = models.ForeignKey(Player, null=True, blank=True, on_delete=models.SET_NULL, related_name='won_sessions')
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)`,
  },
  {
    table_name: 'match_history',
    django_model: 'MatchHistory',
    purpose: 'Historical snapshot recording ELO before/after and K/D per participant',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'game_session_id', type: 'BIGINT', key: 'FK -> game_sessions.id', extra: 'NOT NULL' },
      { name: 'player_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'NOT NULL' },
      { name: 'opponent_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'NOT NULL' },
      { name: 'result', type: "ENUM('WIN','LOSS','DRAW')", key: '', extra: 'NOT NULL' },
      { name: 'elo_before', type: 'INT', key: '', extra: 'NOT NULL' },
      { name: 'elo_after', type: 'INT', key: '', extra: 'NOT NULL' },
      { name: 'elo_delta', type: 'INT', key: '', extra: 'NOT NULL' },
      { name: 'kills', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'deaths', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'played_at', type: 'DATETIME(6)', key: 'INDEX', extra: 'CURRENT_TIMESTAMP' },
    ],
    indexes: ['PRIMARY (id)', 'KEY idx_player_played (player_id, played_at DESC)'],
    django_code: `class MatchHistory(models.Model):
    game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='records')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='match_history')
    opponent = models.ForeignKey(Player, on_delete=models.CASCADE)
    result = models.CharField(max_length=10, choices=[('WIN', 'Win'), ('LOSS', 'Loss'), ('DRAW', 'Draw')])
    elo_before = models.IntegerField()
    elo_after = models.IntegerField()
    elo_delta = models.IntegerField()
    kills = models.IntegerField(default=0)
    deaths = models.IntegerField(default=0)
    played_at = models.DateTimeField(auto_now_add=True)`,
  },
  {
    table_name: 'matchmaking_queue',
    django_model: 'MatchQueue',
    purpose: 'Active waiting pool with dynamic range expansion and select_for_update locking',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'player_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'UNIQUE' },
      { name: 'elo_rating', type: 'INT', key: 'INDEX', extra: 'NOT NULL' },
      { name: 'status', type: "ENUM('WAITING','MATCHED','CANCELLED')", key: 'INDEX', extra: "DEFAULT 'WAITING'" },
      { name: 'current_range', type: 'INT', key: '', extra: 'DEFAULT 100' },
      { name: 'joined_at', type: 'DATETIME(6)', key: 'INDEX', extra: 'CURRENT_TIMESTAMP' },
    ],
    indexes: ['PRIMARY (id)', 'KEY idx_queue_matching (status, elo_rating)'],
    django_code: `class MatchQueue(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE)
    elo_rating = models.IntegerField()
    status = models.CharField(max_length=20, default='WAITING')
    current_range = models.IntegerField(default=100)
    joined_at = models.DateTimeField(auto_now_add=True)`,
  },
  {
    table_name: 'inventory_items',
    django_model: 'InventoryItem',
    purpose: 'Items, skins, weapons, and badges owned by players',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'player_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'NOT NULL' },
      { name: 'item_name', type: 'VARCHAR(100)', key: '', extra: 'NOT NULL' },
      { name: 'category', type: 'VARCHAR(50)', key: '', extra: 'NOT NULL' },
      { name: 'rarity', type: 'VARCHAR(20)', key: '', extra: "DEFAULT 'COMMON'" },
      { name: 'quantity', type: 'INT', key: '', extra: 'DEFAULT 1' },
      { name: 'acquired_at', type: 'DATETIME(6)', key: '', extra: 'CURRENT_TIMESTAMP' },
    ],
    indexes: ['PRIMARY (id)', 'KEY idx_player_inv (player_id)'],
    django_code: `class InventoryItem(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='inventory')
    item_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    rarity = models.CharField(max_length=20, default='COMMON')
    quantity = models.IntegerField(default=1)
    acquired_at = models.DateTimeField(auto_now_add=True)`,
  },
  {
    table_name: 'achievements',
    django_model: 'Achievement',
    purpose: 'Master catalog of game achievements and conditions',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'code', type: 'VARCHAR(50)', key: 'UNIQUE', extra: 'NOT NULL' },
      { name: 'name', type: 'VARCHAR(100)', key: '', extra: 'NOT NULL' },
      { name: 'description', type: 'TEXT', key: '', extra: 'NOT NULL' },
      { name: 'condition', type: 'VARCHAR(100)', key: '', extra: 'NOT NULL' },
      { name: 'reward_coins', type: 'INT', key: '', extra: 'DEFAULT 0' },
      { name: 'reward_xp', type: 'INT', key: '', extra: 'DEFAULT 0' },
    ],
    indexes: ['PRIMARY (id)', 'UNIQUE KEY uk_achievement_code (code)'],
    django_code: `class Achievement(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    condition = models.CharField(max_length=100)
    reward_coins = models.IntegerField(default=0)
    reward_xp = models.IntegerField(default=0)`,
  },
  {
    table_name: 'player_achievements',
    django_model: 'PlayerAchievement',
    purpose: 'Many-to-Many junction table recording unlocked achievements',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'player_id', type: 'BIGINT', key: 'FK -> players.id', extra: 'NOT NULL' },
      { name: 'achievement_id', type: 'BIGINT', key: 'FK -> achievements.id', extra: 'NOT NULL' },
      { name: 'unlocked_at', type: 'DATETIME(6)', key: '', extra: 'CURRENT_TIMESTAMP' },
    ],
    indexes: ['PRIMARY (id)', 'UNIQUE KEY uk_player_achievement (player_id, achievement_id)'],
    django_code: `class PlayerAchievement(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('player', 'achievement')`,
  },
  {
    table_name: 'rewards',
    django_model: 'Reward',
    purpose: 'Milestones, seasonal rewards, and level-up unlocks',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', extra: 'NOT NULL' },
      { name: 'title', type: 'VARCHAR(100)', key: '', extra: 'NOT NULL' },
      { name: 'reward_type', type: 'VARCHAR(50)', key: '', extra: 'NOT NULL' },
      { name: 'value', type: 'VARCHAR(100)', key: '', extra: 'NOT NULL' },
      { name: 'required_level', type: 'INT', key: '', extra: 'DEFAULT 1' },
    ],
    indexes: ['PRIMARY (id)'],
    django_code: `class Reward(models.Model):
    title = models.CharField(max_length=100)
    reward_type = models.CharField(max_length=50)
    value = models.CharField(max_length=100)
    required_level = models.IntegerField(default=1)`,
  },
];

export const INTERVIEW_TOPICS: InterviewTopic[] = [
  {
    id: 1,
    category: 'Overview & Architecture',
    question: 'Tell me about your ArenaX project (The 60-Second Answer)',
    englishSummary: 'ArenaX is a multiplayer battle-arena backend in Python/Django/DRF/MySQL handling 20+ REST APIs, ELO matchmaking, atomic transactions, and modular service layers.',
    hinglishExplanation: 'ArenaX ek multiplayer battle-arena game ka backend hai jo maine Python, Django, DRF aur MySQL se build kiya hai. Isme 20+ REST APIs hain jo authentication, ELO-based matchmaking, game sessions, real-time leaderboard aur rewards handle karti hain. Core focus tha fair matchmaking, atomic transaction consistency, aur N+1 query optimization.',
    interviewTips: [
      'Deliver this in ~60 seconds with steady pace (approx 130 words).',
      'Mention Python, Django, DRF, MySQL, JWT, ELO, and Atomic Transactions upfront.',
      'Show engineering ownership: talk about race conditions and database indexing.',
    ],
  },
  {
    id: 2,
    category: 'Overview & Architecture',
    question: 'Explain the high-level architecture of ArenaX',
    englishSummary: 'Decoupled architecture: Game Client communicates via HTTP REST to Django REST API -> Service Layer -> Django ORM -> MySQL database.',
    hinglishExplanation: 'Architecture mein 4 main layers hain: 1) Game Client (Web/Mobile) REST call karta hai. 2) Django REST API routing, JWT auth, aur serializer validation karta hai. 3) Service Layer (MatchmakingService, MatchService) core business logic execute karta hai. 4) Django ORM MySQL DB ke saath communicate karta hai.',
    interviewTips: [
      'Draw the layer diagram if on a whiteboard: Client -> DRF -> Services -> ORM -> MySQL.',
      'Emphasize that View is thin, business logic lives in Services (Clean Architecture).',
    ],
  },
  {
    id: 3,
    category: 'Django & DRF',
    question: 'Why separate Player and PlayerStats into two tables instead of one?',
    englishSummary: 'Single Responsibility Principle & performance: Player holds core identity (auth, level, email), while PlayerStats holds volatile gameplay counters that update frequently.',
    hinglishExplanation: 'Player table mein identity data hota hai jo rarely change hota hai (username, email, role). PlayerStats table mein matches_played, kills, deaths aur wins hote hain jo har match ke baad update hote hain. Alag rakhne se locking contention kam hota hai, row-size chota rehta hai, aur database design modular rehta hai.',
    codeSnippet: `class PlayerStats(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='stats')
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)`,
    interviewTips: [
      'Mention reduced lock contention during match result updates.',
      'Mention cleaner serializers: public profile vs full performance metrics.',
    ],
  },
  {
    id: 4,
    category: 'Django & DRF',
    question: 'What is the role of a DRF Serializer and how does it differ from a Model?',
    englishSummary: 'A Model defines database schema & relations; a Serializer transforms complex Python/ORM instances to JSON and validates incoming payloads.',
    hinglishExplanation: 'Django Model database table ka blueprint hai (ORM mapping). DRF Serializer do kaam karta hai: 1) Serialization: Python Model instance ko JSON mein convert karna client ke liye. 2) Deserialization & Validation: Client se aaye JSON data ko validate karke clean Python dictionary banana.',
    codeSnippet: `class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'username', 'elo_rating', 'level']`,
    interviewTips: [
      'Mention validation hooks: validate_<field>() and validate() for cross-field checks.',
    ],
  },
  {
    id: 5,
    category: 'Django & DRF',
    question: 'Explain the full lifecycle of an API Request in Django REST Framework',
    englishSummary: 'Request -> URL Router -> Middleware -> View -> Authentication -> Permission -> Serializer Validation -> Service/ORM -> Serializer Response.',
    hinglishExplanation: 'Client jab POST /api/matchmaking/join/ bhejta hai: Pehle Django URL router matching view dhundta hai. View mein JWT Authentication header verify hoti hai. Uske baad Permission class check hoti hai (IsAuthenticated). Serializer input JSON validate karta hai. Service layer match dhundta hai. ORM database query run karta hai. Serializer response JSON pack karta hai aur HTTP 201 return hota hai.',
    interviewTips: [
      'Remember the exact sequence: URL -> Auth -> Perm -> Validation -> Business Logic -> Response.',
    ],
  },
  {
    id: 6,
    category: 'ELO & Matchmaking',
    question: 'How does the ELO rating formula calculate Expected Score?',
    englishSummary: 'Expected score formula: E_A = 1 / (1 + 10^((R_B - R_A)/400)). Higher rated player has higher expected probability.',
    hinglishExplanation: 'Formula hai: E_A = 1 / (1 + 10^((R_B - R_A)/400)). Agar Player A = 1500 aur Player B = 1400: exponent banega (1400 - 1500)/400 = -100/400 = -0.25. 10^(-0.25) ≈ 0.562. Toh E_A = 1 / (1 + 0.562) ≈ 0.64 (64% winning chance). Opponent ka E_B = 1 - 0.64 = 0.36.',
    codeSnippet: `def calculate_expected_score(rating_a: int, rating_b: int) -> float:
    return 1.0 / (1.0 + 10.0 ** ((rating_b - rating_a) / 400.0))`,
    interviewTips: [
      'Explain that the 400 factor means a 400 ELO difference implies a 10:1 win probability ratio (91% vs 9%).',
      'Sum of expected scores is always 1.0: E_A + E_B = 1.',
    ],
  },
  {
    id: 7,
    category: 'ELO & Matchmaking',
    question: 'How are ELO ratings updated after a match? What is K-factor?',
    englishSummary: 'New Rating = Old Rating + K * (Actual Score - Expected Score). K-factor (typically 32) controls rating volatility.',
    hinglishExplanation: 'Formula: New_Rating = Old_Rating + K * (Actual - Expected). Winner ka Actual = 1, Loser ka 0. Agar Player A (1500, E=0.64) jeet gaya: New = 1500 + 32 * (1 - 0.64) = 1500 + 11.52 ≈ 1512. Player B (1400, E=0.36) haar gaya: New = 1400 + 32 * (0 - 0.36) = 1400 - 11.52 ≈ 1388. Rating system zero-sum hai: jo A ne gain kiya, B ne utna hi lose kiya.',
    codeSnippet: `def update_elo(rating_a: int, rating_b: int, score_a: float, k: int = 32):
    expected_a = 1.0 / (1.0 + 10.0 ** ((rating_b - rating_a) / 400.0))
    expected_b = 1.0 - expected_a
    new_a = round(rating_a + k * (score_a - expected_a))
    new_b = round(rating_b + k * ((1.0 - score_a) - expected_b))
    return new_a, new_b`,
    interviewTips: [
      'Explain K-factor: higher K (32 or 40) for placement/newbies, lower K (16) for seasoned masters.',
      'Highlight zero-sum conservation of total rating points in a 1v1 match.',
    ],
  },
  {
    id: 8,
    category: 'ELO & Matchmaking',
    question: 'Explain the Dynamic Matchmaking Window algorithm',
    englishSummary: 'Queue starts matching within ±100 ELO. If no opponent after 10s, expands to ±200, then ±300 at 20s, balancing fairness vs queue wait time.',
    hinglishExplanation: 'Fixed difference rakhne par high ELO players ko matches milne mein ghanto lag sakte hain. Isliye hum dynamic expanding window use karte hain: Join hone par range = ±100. Agar 10 seconds tak koi match nahi mila, window expand hoti hai ±200 tak. 20 seconds baad ±300. Jaise hi valid candidate milta hai jiska ELO difference minimum ho, instant match ban jata hai.',
    codeSnippet: `def get_search_window(seconds_in_queue: int) -> int:
    if seconds_in_queue < 10:
        return 100
    elif seconds_in_queue < 20:
        return 200
    else:
        return 300`,
    interviewTips: [
      'Call this the "fairness vs latency trade-off". Every competitive game (Valorant, CS2, LoL) uses this.',
    ],
  },
  {
    id: 9,
    category: 'Concurrency & Transactions',
    question: 'What is the Matchmaking Race Condition and how does select_for_update() solve it?',
    englishSummary: 'Two concurrent matchmaking threads could pick the same waiting candidate simultaneously, creating a duplicate match. select_for_update() acquires a row-level write lock.',
    hinglishExplanation: 'Race condition problem: Worker Thread A aur Thread B dono ne same time pe query ki aur dono ko Player X candidate mila. Dono ne Player X ko apni game session mein add kar diya! Solution: with transaction.atomic() ke andar MatchQueue.objects.select_for_update().filter(status="WAITING") use kiya. MySQL is row pe exclusive write lock laga deta hai. Jab tak Thread A commit nahi karta, Thread B wait karega aur Player X duplicate match hone se bach jayega.',
    codeSnippet: `with transaction.atomic():
    candidate = MatchQueue.objects.select_for_update().filter(
        status='WAITING'
    ).exclude(player=current_player).first()
    if candidate:
        candidate.status = 'MATCHED'
        candidate.save()
        create_game_session(current_player, candidate.player)`,
    interviewTips: [
      'Explain SELECT ... FOR UPDATE translates to InnoDB row-level locking (Pessimistic Locking).',
      'Mention that without select_for_update(), dirty reads / double allocation occur under load.',
    ],
  },
  {
    id: 10,
    category: 'Concurrency & Transactions',
    question: 'Why are atomic database transactions critical during Match Result handling?',
    englishSummary: 'Updating match outcome involves 5 interrelated tables. If the server crashes midway, data becomes corrupt without transaction.atomic() rollback.',
    hinglishExplanation: 'Match result process karne mein 5 operations hote hain: 1) GameSession status = COMPLETED, 2) Player A ELO & stats update, 3) Player B ELO & stats update, 4) MatchHistory record creation, 5) Rewards & Achievements unlock. Agar 3rd step pe server crash ho gaya, toh winner ka ELO badh gaya par loser ka nahi ghata! Inconsistency create ho jayegi. transaction.atomic() ensure karta hai ki sabhi operations sath mein COMMIT hon ya fir pura ROLLBACK ho jaye (ACID Atomicity).',
    codeSnippet: `with transaction.atomic():
    session.status = 'COMPLETED'
    session.save()
    winner.elo_rating = new_winner_elo
    winner.save()
    loser.elo_rating = new_loser_elo
    loser.save()
    MatchHistory.objects.create(...)
    check_and_grant_rewards(winner)`,
    interviewTips: [
      'Mention the A in ACID: Atomicity. All-or-nothing guarantee.',
    ],
  },
  {
    id: 11,
    category: 'MySQL & Performance',
    question: 'What is the N+1 Query Problem and how do select_related and prefetch_related solve it?',
    englishSummary: 'Looping over 100 players and accessing player.stats triggers 1 + 100 queries. select_related uses SQL JOIN for 1 query; prefetch_related uses SQL IN for M2M.',
    hinglishExplanation: 'N+1 problem tab hota hai jab aap: players = Player.objects.all() karte ho (1 query), aur fir loop mein: for p in players: print(p.stats.wins). Agar 100 players hain, toh 100 additional queries database pe hit hongi! Total 101 queries! Solution: select_related("stats") use karne par Django ek single SQL INNER JOIN run karta hai, aur data 1 hi query mein aa jata hai. For many-to-many relationships (like inventory, achievements), prefetch_related() use karte hain jo 2 queries mein pura data IN clause se load karta hai.',
    codeSnippet: `# BAD (N+1 Queries = 101 DB roundtrips)
players = Player.objects.all()
wins = [p.stats.wins for p in players]

# GOOD (1 Query with SQL JOIN)
players = Player.objects.select_related('stats').all()

# MANY-TO-MANY (2 Queries total)
players = Player.objects.prefetch_related('inventory').all()`,
    interviewTips: [
      'Key rule: select_related for ForeignKey/OneToOne (SQL JOIN), prefetch_related for ManyToMany/Reverse FK (SQL IN clause).',
      'Demonstrates real-world production performance awareness.',
    ],
  },
  {
    id: 12,
    category: 'MySQL & Performance',
    question: 'Why and how did you index the elo_rating column?',
    englishSummary: 'Leaderboards sort by elo_rating DESC. Without an index, MySQL executes a full table scan and filesort. A B-tree index allows O(log N) lookup and instant top-N retrieval.',
    hinglishExplanation: 'Agar 1 million players hain aur query: SELECT * FROM players ORDER BY elo_rating DESC LIMIT 10 execute hoti hai bina index ke, toh MySQL pura table scan karega aur disk filesort karega jo 500ms+ le sakta hai. Index add karne se MySQL B-tree structure maintain karta hai. Query directly leaf nodes se top 10 rows fetch kar leti hai O(log N) time mein, taking less than 2 milliseconds.',
    codeSnippet: `class Meta:
    indexes = [
        models.Index(fields=['-elo_rating'], name='idx_elo_desc'),
    ]`,
    interviewTips: [
      'Explain that indexes speed up reads but slightly add overhead to writes (INSERT/UPDATE). Because matchmaking and leaderboard reads are high volume, indexing is essential.',
    ],
  },
  {
    id: 13,
    category: 'Security & Scalability',
    question: 'Explain JWT Authentication: Access Token vs Refresh Token',
    englishSummary: 'Access tokens are stateless and short-lived (15 mins) for API requests. Refresh tokens are long-lived (7 days) and stored securely to reissue access tokens.',
    hinglishExplanation: 'JWT mein 3 parts hote hain: Header.Payload.Signature. Login hone par client ko do tokens milte hain: 1) Access Token: 15 minutes validity hoti hai. Client har request ke Authorization: Bearer <token> header mein bhejta hai. Server stateless verify karta hai without DB lookup. 2) Refresh Token: 7 days validity hoti hai. Jab access token expire hota hai, client POST /api/token/refresh/ call karke naya access token generate karta hai. Isse security aur UX dono balance rehte hain.',
    interviewTips: [
      'Mention token blacklisting on logout using django-rest-framework-simplejwt token blacklist.',
      'Explain why short access token TTL minimizes blast radius if intercepted.',
    ],
  },
  {
    id: 14,
    category: 'Security & Scalability',
    question: 'How would you scale ArenaX to support 1 Million concurrent players?',
    englishSummary: 'Layered architecture: Load Balancer -> Stateless Django app pods -> Redis for Matchmaking Queues & Leaderboard sorted sets -> Celery async workers -> MySQL Read Replicas.',
    hinglishExplanation: 'Millions of users ke liye: 1) NGINX / Cloud Load Balancer stateless Django containers ko traffic distribute karega. 2) Matchmaking queue MySQL se hata kar Redis mein shift karenge (Redis In-Memory speed aur sorted sets). 3) Top Leaderboard Redis ZSET mein store hoga (ZREVRANGEBYSCORE instant O(log N) rankings). 4) Heavy tasks (match result processing, achievements, email notifications) Celery background workers ko delegate honge. 5) MySQL Primary-Replica setup: writes primary pe, reads replicas pe.',
    interviewTips: [
      'Be clear: Celery for async tasks, Redis for caching & in-memory queue, Read Replicas for read-heavy leaderboards.',
      'Mention server-authoritative architecture to prevent client-side score tampering.',
    ],
  },
  {
    id: 15,
    category: 'Security & Scalability',
    question: 'How do you prevent cheating in ArenaX game backend?',
    englishSummary: 'Server-authoritative architecture: Clients never send updated ELO or victory claims directly. Clients submit raw match events; server validates rules and calculates ratings.',
    hinglishExplanation: 'Client ko kabhi trust nahi karna chahiye (Zero Client Trust). Agar client payload mein {"elo": 5000} ya {"result": "WIN"} bhejta hai aur backend seedha accept kar le, toh koi bhi script-kiddie top rank ban jayega. ArenaX mein client sirf match telemetry/session token bhejta hai. Backend match integrity check karta hai, server-side ELO calculate karta hai, aur database update karta hai.',
    interviewTips: [
      'Quote the golden rule of game backend engineering: "Never trust the client".',
    ],
  },
];
