import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Spinner,
  HStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Icon,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { FaMap, FaMapMarkerAlt, FaSync, FaLightbulb, FaEllipsisV, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';
import KakaoMap from '../components/KakaoMap';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

interface Spot {
  id: number;
  name: string;
  description?: string;
  address: string;
  category: string;
  time?: string;
  tel?: string;
  homepage?: string;
  price?: number;
  image_url?: string;
  open_time?: string;
  closed_days?: string;
  parking?: string;
  facilities?: string;
  content_type?: string;
}

interface Accommodation {
  id: number;
  name: string;
  address: string;
  price?: number;
  time?: string;
  tel?: string;
  homepage?: string;
  category?: string;
  check_in?: string;
  check_out?: string;
}

interface DailyPlan {
  spots: Spot[];
  accommodation?: Accommodation;
  transportation?: string;
  meals?: string[];
}

interface PlanData {
  destination: string;
  total_days: number;
  total_cost: number;
  daily_plans: DailyPlan[];
  recommendations?: string[];
  interests?: string[];
}

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  const { user } = useAuth();
  
  // 추천 장소 모달 상태 추가
  const [recommendedSpots, setRecommendedSpots] = useState<any[]>([]);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [currentSpotInfo, setCurrentSpotInfo] = useState<{
    type: string;
    dayIndex: number;
    spotIndex: number;
  } | null>(null);

  useEffect(() => {
    if (router.isReady) {
      const { data } = router.query;
      if (typeof data === 'string') {
        try {
          setPlan(JSON.parse(decodeURIComponent(data)));
        } catch {
          setPlan(null);
        }
      }
      setTimeout(() => setLoading(false), 300);
    }
  }, [router.isReady, router.query]);

  // 지도 보기 함수
  const handleShowMap = () => {
    setShowMap(true);
    onOpen();
  };

  // 현재 선택된 일차의 여행지들 추출
  const getCurrentDaySpots = () => {
    if (!plan || !plan.daily_plans[selectedDay]) return [];
    
    const day = plan.daily_plans[selectedDay];
    const spots = [...(day.spots || [])];
    
    // 숙소도 포함 - 더 안전한 조건으로 변경
    if (day.accommodation && (day.accommodation.name || day.accommodation.id)) {
      spots.push({
        ...day.accommodation,
        category: '숙소',
        time: day.accommodation.time || '체크인/체크아웃'
      });
    }
    
    return spots;
  };

  // 장소 새로고침 함수
  const handleRefreshSpot = async (spotType: string, dayIndex: number, spotIndex: number) => {
    try {
      if (!user) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Firebase 인증 토큰 가져오기
      const token = await user.getIdToken();
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const response = await fetch(apiUrl('/api/refresh-spot'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          spot_type: spotType,
          destination: plan?.destination || '',
          interests: plan?.interests || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `서버 오류: ${response.status}`);
      }

      const result = await response.json();
      const newSpot = result.data;
      
      // 여행 계획 업데이트
      const updatedPlan = { ...plan };
      if (updatedPlan && updatedPlan.daily_plans) {
        if (spotType === 'accommodation') {
          updatedPlan.daily_plans[dayIndex].accommodation = newSpot;
        } else {
          updatedPlan.daily_plans[dayIndex].spots[spotIndex] = newSpot;
        }
        setPlan(updatedPlan as PlanData);
      }
      
      toast({
        title: "장소가 새로고침되었습니다!",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('장소 새로고침 오류:', error);
      toast({
        title: "오류가 발생했습니다.",
        description: error.message || '알 수 없는 오류가 발생했습니다.',
        status: "error",
        duration: 3000,
      });
    }
  };

  // 장소 추천 함수
  const handleRecommendSpots = async (currentSpotId: number, spotType: string, dayIndex: number, spotIndex: number) => {
    try {
      if (!user) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Firebase 인증 토큰 가져오기
      const token = await user.getIdToken();
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const response = await fetch(apiUrl('/api/recommend-spots'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_spot_id: currentSpotId,
          spot_type: spotType,
          destination: plan?.destination || '',
          interests: plan?.interests || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `서버 오류: ${response.status}`);
      }

      const result = await response.json();
      const spots = result.data;
      
      // 추천 장소들을 상태에 저장하고 모달 열기
      setRecommendedSpots(spots);
      setCurrentSpotInfo({ type: spotType, dayIndex, spotIndex });
      setRecommendModalOpen(true);
      
      toast({
        title: "추천 장소를 확인하세요!",
        description: `${spots.length}개의 대안 장소를 찾았습니다.`,
        status: "info",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('장소 추천 오류:', error);
      toast({
        title: "오류가 발생했습니다.",
        description: error.message || '알 수 없는 오류가 발생했습니다.',
        status: "error",
        duration: 3000,
      });
    }
  };

  // 추천 장소 선택 함수
  const handleSelectRecommendedSpot = (selectedSpot: any) => {
    if (!currentSpotInfo || !plan) return;
    
    const updatedPlan = { ...plan };
    
    if (currentSpotInfo.type === 'accommodation') {
      updatedPlan.daily_plans[currentSpotInfo.dayIndex].accommodation = selectedSpot;
    } else {
      updatedPlan.daily_plans[currentSpotInfo.dayIndex].spots[currentSpotInfo.spotIndex] = selectedSpot;
    }
    
    setPlan(updatedPlan as PlanData);
    setRecommendModalOpen(false);
    setRecommendedSpots([]);
    setCurrentSpotInfo(null);
    
    toast({
      title: "장소가 변경되었습니다!",
      status: "success",
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <Container maxW="container.sm" py={16}>
        <VStack>
          <Spinner size="xl" thickness="6px" color="teal.400" speed="0.8s" />
          <Heading size="md" color="teal.600" mt={4}>여행 계획을 생성 중입니다...</Heading>
          <Text color="gray.500">AI가 맞춤 여행 일정을 만드는 중입니다. 잠시만 기다려 주세요!</Text>
        </VStack>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container maxW="container.sm" py={16}>
        <Box p={8} bg="white" borderRadius="2xl" boxShadow="2xl" textAlign="center">
          <Heading size="md" mb={4} color="teal.600">여행 계획이 없습니다</Heading>
          <Text>메인페이지에서 여행 계획을 먼저 생성해 주세요.</Text>
        </Box>
      </Container>
    );
  }

  // 추천 숙소/식당 추출
  const allSpots = plan.daily_plans.flatMap(day => day.spots || []);
  // 숙소: category가 '숙소'인 경우만 (CSV 파일 기준)
  const accommodations = plan.daily_plans
    .map(day => day.accommodation)
    .filter((acc): acc is Accommodation => {
      if (!acc) return false;
      if (!acc.name) return false;
      if (!acc.category) return false;
      return acc.category === '숙소';
    })
    .filter((acc, idx, arr) => arr.findIndex(a => a.name === acc.name) === idx);
  // 식당: category가 '식당'인 경우만 (CSV 파일 기준)
  const restaurants = allSpots
    .filter((spot: Spot) => spot.category === '식당')
    .filter((res, idx, arr) => arr.findIndex(r => r.name === res.name) === idx);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #EBF8FF, #E6FFFA, #FAF5FF)' }}>
      {/* Header */}
      <Header />
      
      <Container maxW="container.xl" py={8} mt="60px">
        <Box 
          p={8} 
          bgGradient="linear(135deg, white 0%, blue.50 100%)"
          borderRadius="3xl" 
          boxShadow="0 25px 50px rgba(0,0,0,0.1)"
          border="1px solid"
          borderColor="blue.100"
          mb={8}
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #38B2AC 0%, #3182CE 100%)',
          }}
        >
          <VStack spacing={6} align="stretch">
            <HStack spacing={4} align="center">
              <Box
                w={16}
                h={16}
                bgGradient="linear(135deg, teal.400, blue.500)"
                borderRadius="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="2xl"
                boxShadow="0 8px 25px rgba(56, 178, 172, 0.3)"
              >
                ✈️
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="xl" color="teal.700" fontWeight="bold">
                  {plan.destination} 여행 계획
                </Heading>
                <HStack spacing={6} color="gray.600">
                  <HStack spacing={2}>
                    <Icon as={FaCalendar} color="teal.500" />
                    <Text fontWeight="medium">총 {plan.total_days}일</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FaMoneyBillWave} color="green.500" />
                    <Text fontWeight="medium">총 예상 비용: {plan.total_cost.toLocaleString()}원</Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
            
          {plan.recommendations && plan.recommendations.length > 0 && (
              <Box 
                p={4} 
                bg="white" 
                borderRadius="xl" 
                border="1px solid"
                borderColor="teal.100"
                boxShadow="0 4px 15px rgba(0,0,0,0.05)"
              >
                <HStack spacing={2} mb={3}>
                  <Icon as={FaLightbulb} color="teal.500" />
                  <Heading size="sm" color="teal.600">AI 추천 사항</Heading>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                {plan.recommendations.map((rec, idx) => (
                    <HStack key={idx} spacing={2}>
                      <Box w={2} h={2} bg="teal.400" borderRadius="full" />
                      <Text color="gray.700" fontSize="sm">{rec}</Text>
                    </HStack>
                ))}
                </SimpleGrid>
            </Box>
          )}
          </VStack>
        </Box>
        <Box 
          bg="white" 
          borderRadius="3xl" 
          boxShadow="0 20px 40px rgba(0,0,0,0.08)"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Tabs colorScheme="teal" variant="unstyled">
            <TabList 
              bg="gray.50" 
              p={2} 
              borderRadius="2xl" 
              mx={4} 
              mt={4}
              mb={6}
            >
              <Tab 
                fontWeight="bold" 
                borderRadius="xl"
                _selected={{ 
                  bg: "white", 
                  color: "teal.600",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
                _hover={{ bg: "gray.100" }}
                transition="all 0.2s"
              >
                📅 일정표
              </Tab>
              <Tab 
                fontWeight="bold" 
                borderRadius="xl"
                _selected={{ 
                  bg: "white", 
                  color: "teal.600",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
                _hover={{ bg: "gray.100" }}
                transition="all 0.2s"
              >
                ℹ️ 기본 정보
              </Tab>
            </TabList>
            <TabPanels>
              {/* 일정표 탭 */}
              <TabPanel px={isMobile ? 0 : 4}>
                <VStack spacing={6} align="stretch">
                  <HStack spacing={3} mb={4} flexWrap="wrap" justify="center">
                  {plan.daily_plans.map((_, idx) => (
                    <Button
                      key={idx}
                        size="lg"
                      colorScheme={selectedDay === idx ? 'teal' : 'gray'}
                      variant={selectedDay === idx ? 'solid' : 'outline'}
                        borderRadius="2xl"
                        px={6}
                        py={3}
                      onClick={() => setSelectedDay(idx)}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        }}
                        transition="all 0.3s ease"
                        boxShadow={selectedDay === idx ? '0 8px 25px rgba(56, 178, 172, 0.3)' : 'none'}
                      >
                        <VStack spacing={1}>
                          <Text fontSize="lg" fontWeight="bold">{idx + 1}일차</Text>
                          <Text fontSize="xs" opacity={0.8}>Day {idx + 1}</Text>
                        </VStack>
                    </Button>
                  ))}
                  </HStack>
                  
                  <HStack justify="center" spacing={4}>
                  <Button
                      size="lg"
                    colorScheme="teal"
                    variant="outline"
                      borderRadius="2xl"
                      px={8}
                      py={3}
                    leftIcon={<FaMap />}
                    onClick={handleShowMap}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(56, 178, 172, 0.2)',
                        bg: 'teal.50'
                      }}
                      transition="all 0.3s ease"
                      borderWidth="2px"
                    >
                      🗺️ 지도 보기
                  </Button>
                </HStack>
                </VStack>
                <Box 
                  p={isMobile ? 4 : 8} 
                  bgGradient="linear(135deg, white 0%, gray.50 100%)"
                  borderRadius="3xl" 
                  boxShadow="0 15px 35px rgba(0,0,0,0.08)"
                  border="1px solid"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '3px',
                    background: 'linear-gradient(90deg, #38B2AC 0%, #3182CE 100%)',
                  }}
                >
                  <VStack spacing={6} align="stretch">
                    <HStack spacing={4} align="center" justify="center">
                      <Box
                        w={12}
                        h={12}
                        bgGradient="linear(135deg, teal.400, blue.500)"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="xl"
                        boxShadow="0 6px 20px rgba(56, 178, 172, 0.3)"
                      >
                        📅
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Heading size="lg" color="teal.700" fontWeight="bold">
                          {selectedDay + 1}일차 일정
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                          오늘의 여행 계획을 확인하세요
                        </Text>
                      </VStack>
                    </HStack>
                  <VStack align="stretch" spacing={4}>
                    {(() => {
                      const day = plan.daily_plans[selectedDay];
                      if (!day) {
                        return (
                          <Box 
                            p={8} 
                            bgGradient="linear(135deg, gray.50 0%, blue.50 100%)"
                            borderRadius="2xl" 
                            textAlign="center" 
                            color="gray.600"
                            border="2px dashed"
                            borderColor="gray.300"
                            boxShadow="0 4px 15px rgba(0,0,0,0.05)"
                          >
                            <VStack spacing={4}>
                              <Box
                                w={16}
                                h={16}
                                bgGradient="linear(135deg, gray.400, blue.500)"
                                borderRadius="2xl"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="white"
                                fontSize="2xl"
                                boxShadow="0 6px 20px rgba(0,0,0,0.1)"
                              >
                                📅
                              </Box>
                              <VStack spacing={2}>
                                <Text fontSize="lg" fontWeight="bold">오늘은 추천 일정이 없습니다</Text>
                                <Text fontSize="sm" opacity={0.8}>다른 날짜를 선택해 보세요!</Text>
                              </VStack>
                            </VStack>
                          </Box>
                        );
                      }
                      
                      const spots = [...(day.spots || [])];
                      // 시간 순 정렬 (time: "09:00~10:30" → 09:00 기준)
                      spots.sort((a, b) => {
                        const getStart = (t: string | undefined) => {
                          if (!t) return '';
                          const parts = t.split('~');
                          return parts[0]?.trim() || '';
                        };
                        const toNum = (t: string) => t ? parseInt(t.replace(':', ''), 10) : 9999;
                        return toNum(getStart(a.time)) - toNum(getStart(b.time));
                      });
                      const hasAccommodation = day.accommodation?.name;
                      if (spots.length === 0 && !hasAccommodation) {
                        return (
                          <Box 
                            p={8} 
                            bgGradient="linear(135deg, gray.50 0%, blue.50 100%)"
                            borderRadius="2xl" 
                            textAlign="center" 
                            color="gray.600"
                            border="2px dashed"
                            borderColor="gray.300"
                            boxShadow="0 4px 15px rgba(0,0,0,0.05)"
                          >
                            <VStack spacing={4}>
                              <Box
                                w={16}
                                h={16}
                                bgGradient="linear(135deg, gray.400, blue.500)"
                                borderRadius="2xl"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="white"
                                fontSize="2xl"
                                boxShadow="0 6px 20px rgba(0,0,0,0.1)"
                              >
                                📅
                              </Box>
                              <VStack spacing={2}>
                                <Text fontSize="lg" fontWeight="bold">오늘은 추천 일정이 없습니다</Text>
                                <Text fontSize="sm" opacity={0.8}>다른 날짜를 선택해 보세요!</Text>
                              </VStack>
                            </VStack>
                          </Box>
                        );
                      }
                      const cards = [];
                      // 숙소 표시 (더 안전한 조건)
                      if (day.accommodation && (day.accommodation.name || day.accommodation.id)) {
                        cards.push(
                          <Box 
                            key={`${selectedDay}-accommodation-${day.accommodation?.id || day.accommodation?.name || 'default'}`}
                            p={6} 
                            bgGradient="linear(135deg, teal.50 0%, blue.50 100%)"
                            borderRadius="2xl" 
                            boxShadow="0 10px 25px rgba(56, 178, 172, 0.15)"
                            border="2px solid"
                            borderColor="teal.200"
                            mb={4}
                            position="relative"
                            overflow="hidden"
                            _hover={{
                              transform: 'translateY(-4px)',
                              boxShadow: '0 20px 40px rgba(56, 178, 172, 0.25)',
                            }}
                            transition="all 0.3s ease"
                            _before={{
                              content: '""',
                              position: 'absolute',
                              top: '0',
                              left: '0',
                              right: '0',
                              height: '3px',
                              background: 'linear-gradient(90deg, #38B2AC 0%, #3182CE 100%)',
                            }}
                          >
                            <VStack spacing={4} align="stretch">
                              <HStack justify="space-between" align="flex-start">
                                <HStack spacing={3}>
                                  <Box
                                    w={12}
                                    h={12}
                                    bgGradient="linear(135deg, teal.400, blue.500)"
                                    borderRadius="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="white"
                                    fontSize="xl"
                                    boxShadow="0 4px 15px rgba(56, 178, 172, 0.3)"
                                  >
                                    🏨
                                  </Box>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="bold" fontSize="lg" color="teal.700">숙소</Text>
                                    <Text color="teal.600" fontSize="sm" fontWeight="medium">
                                      {day.accommodation.name || '숙소명 없음'}
                                    </Text>
                                  </VStack>
                                </HStack>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  colorScheme="teal"
                                  leftIcon={<FaCalendar />}
                                  onClick={() => {
                                    // 예약 페이지로 이동
                                    router.push('/booking');
                                  }}
                                >
                                  예약하기
                                </Button>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<FaEllipsisV />}
                                    variant="ghost"
                                    size="sm"
                                    color="teal.600"
                                  />
                                  <MenuList>
                                    <MenuItem 
                                      icon={<FaSync />} 
                                      onClick={() => handleRefreshSpot('accommodation', selectedDay, -1)}
                                    >
                                      다른 숙소로 변경
                                    </MenuItem>
                                    <MenuItem 
                                      icon={<FaLightbulb />} 
                                      onClick={() => handleRecommendSpots(day.accommodation?.id || 0, 'accommodation', selectedDay, -1)}
                                    >
                                      대안 숙소 추천
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </HStack>
                            </HStack>
                            <Text color="gray.700">{day.accommodation.name || '숙소명 없음'}</Text>
                            <Text color="gray.700">🕒 <b>체크인/체크아웃:</b> {day.accommodation.time || '정보 없음'}</Text>
                            <Text color="gray.700">📍 <b>주소:</b> {day.accommodation.address || '정보 없음'}</Text>
                            <Text color="gray.700">�� <b>숙박비:</b> {(day.accommodation.price || 0).toLocaleString()}</Text>
                            <Text color="gray.700">☎️ <b>전화번호:</b> {day.accommodation.tel || '정보 없음'}</Text>
                            <Text color="gray.700">🔗 <b>홈페이지:</b> {day.accommodation.homepage || '정보 없음'}</Text>
                            </VStack>
                          </Box>
                        );
                      } else {
                      }
                      cards.push(...spots.map((spot: Spot, spotIdx: number) => {
                        // 카테고리별 색상과 아이콘 설정
                        const getCategoryStyle = (category: string) => {
                          switch (category) {
                            case '식당':
                              return {
                                bg: 'linear-gradient(135deg, orange.50 0%, red.50 100%)',
                                borderColor: 'orange.200',
                                icon: '🍽️',
                                iconBg: 'linear-gradient(135deg, orange.400, red.500)',
                                dotColor: 'orange.400',
                                titleColor: 'orange.700'
                              };
                            case '문화':
                              return {
                                bg: 'linear-gradient(135deg, purple.50 0%, pink.50 100%)',
                                borderColor: 'purple.200',
                                icon: '🎭',
                                iconBg: 'linear-gradient(135deg, purple.400, pink.500)',
                                dotColor: 'purple.400',
                                titleColor: 'purple.700'
                              };
                            case '자연':
                              return {
                                bg: 'linear-gradient(135deg, green.50 0%, teal.50 100%)',
                                borderColor: 'green.200',
                                icon: '🌿',
                                iconBg: 'linear-gradient(135deg, green.400, teal.500)',
                                dotColor: 'green.400',
                                titleColor: 'green.700'
                              };
                            case '쇼핑':
                              return {
                                bg: 'linear-gradient(135deg, pink.50 0%, purple.50 100%)',
                                borderColor: 'pink.200',
                                icon: '🛍️',
                                iconBg: 'linear-gradient(135deg, pink.400, purple.500)',
                                dotColor: 'pink.400',
                                titleColor: 'pink.700'
                              };
                            case '액티비티':
                              return {
                                bg: 'linear-gradient(135deg, blue.50 0%, indigo.50 100%)',
                                borderColor: 'blue.200',
                                icon: '🏃',
                                iconBg: 'linear-gradient(135deg, blue.400, indigo.500)',
                                dotColor: 'blue.400',
                                titleColor: 'blue.700'
                              };
                            case '휴식':
                              return {
                                bg: 'linear-gradient(135deg, yellow.50 0%, orange.50 100%)',
                                borderColor: 'yellow.200',
                                icon: '🧘',
                                iconBg: 'linear-gradient(135deg, yellow.400, orange.500)',
                                dotColor: 'yellow.400',
                                titleColor: 'yellow.700'
                              };
                            default:
                              return {
                                bg: 'linear-gradient(135deg, gray.50 0%, blue.50 100%)',
                                borderColor: 'gray.200',
                                icon: '📍',
                                iconBg: 'linear-gradient(135deg, gray.400, blue.500)',
                                dotColor: 'gray.400',
                                titleColor: 'gray.700'
                              };
                          }
                        };
                        
                        const style = getCategoryStyle(spot.category);
                        
                        return (
                          <Box 
                            key={`${selectedDay}-${spotIdx}-${spot.id || spot.name}`}
                            p={6} 
                            bgGradient={style.bg}
                            borderRadius="2xl" 
                            boxShadow="0 10px 25px rgba(0,0,0,0.08)"
                            border="2px solid"
                            borderColor={style.borderColor}
                            mb={4}
                            position="relative"
                            overflow="hidden"
                            _hover={{
                              transform: 'translateY(-4px)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                            }}
                            transition="all 0.3s ease"
                            _before={{
                              content: '""',
                              position: 'absolute',
                              top: '0',
                              left: '0',
                              right: '0',
                              height: '3px',
                              background: style.iconBg,
                            }}
                          >
                            <VStack spacing={4} align="stretch">
                              <HStack justify="space-between" align="flex-start">
                                <HStack spacing={4} align="flex-start">
                                  {spot.image_url && (
                                    <Image 
                                      src={spot.image_url} 
                                      alt={spot.name} 
                                      boxSize="80px" 
                                      objectFit="cover" 
                                      borderRadius="xl"
                                      boxShadow="0 4px 15px rgba(0,0,0,0.1)"
                                    />
                                  )}
                                  <VStack align="start" spacing={2} flex={1}>
                                    <HStack spacing={3} align="center">
                                      <Box
                                        w={10}
                                        h={10}
                                        bgGradient={style.iconBg}
                                        borderRadius="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        color="white"
                                        fontSize="lg"
                                        boxShadow="0 4px 15px rgba(0,0,0,0.2)"
                                      >
                                        {style.icon}
                                      </Box>
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold" fontSize="lg" color={style.titleColor}>
                                          {spot.name || '이름 없음'}
                                        </Text>
                                        <Badge 
                                          colorScheme={spot.category === '식당' ? 'orange' : 'teal'} 
                                          variant="subtle" 
                                          borderRadius="full"
                                          px={3}
                                          py={1}
                                        >
                                          {spot.category || '기타'}
                                        </Badge>
                                      </VStack>
                                    </HStack>
                                    {spot.description && (
                                      <Text color="gray.600" fontSize="sm" lineHeight="1.5">
                                        {spot.description}
                                      </Text>
                                    )}
                                  </VStack>
                                </HStack>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<FaEllipsisV />}
                                    variant="ghost"
                                    size="sm"
                                    color={style.titleColor}
                                    borderRadius="lg"
                                    _hover={{ bg: 'whiteAlpha.300' }}
                                  />
                                  <MenuList>
                                    <MenuItem 
                                      icon={<FaSync />} 
                                      onClick={() => handleRefreshSpot(spot.category === '식당' ? 'restaurant' : 'attraction', selectedDay, spotIdx)}
                                    >
                                      다른 장소로 변경
                                    </MenuItem>
                                    <MenuItem 
                                      icon={<FaLightbulb />} 
                                      onClick={() => handleRecommendSpots(spot.id, spot.category === '식당' ? 'restaurant' : 'attraction', selectedDay, spotIdx)}
                                    >
                                      대안 장소 추천
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </HStack>
                              
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} fontSize="sm">
                                {spot.time && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">🕒 <b>시간:</b> {spot.time}</Text>
                                  </HStack>
                                )}
                                {spot.address && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">📍 <b>주소:</b> {spot.address}</Text>
                                  </HStack>
                                )}
                                {spot.open_time && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">⏰ <b>운영시간:</b> {spot.open_time}</Text>
                                  </HStack>
                                )}
                                {spot.closed_days && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">🚫 <b>휴무일:</b> {spot.closed_days}</Text>
                                  </HStack>
                                )}
                                {spot.price && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">💰 <b>예상 비용:</b> {spot.price.toLocaleString()}원</Text>
                                  </HStack>
                                )}
                                {spot.tel && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">☎️ <b>전화번호:</b> {spot.tel}</Text>
                                  </HStack>
                                )}
                                {spot.homepage && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">🔗 <b>홈페이지:</b> {spot.homepage}</Text>
                                  </HStack>
                                )}
                                {spot.parking && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">🅿️ <b>주차:</b> {spot.parking}</Text>
                                  </HStack>
                                )}
                                {spot.facilities && (
                                  <HStack spacing={2}>
                                    <Box w={2} h={2} bg={style.dotColor} borderRadius="full" />
                                    <Text color="gray.700">🏢 <b>시설:</b> {spot.facilities}</Text>
                                  </HStack>
                                )}
                              </SimpleGrid>
                            </VStack>
                          </Box>
                        );
                      }));
                      return cards;
                    })()}
                    <Text><strong>교통:</strong> {plan.daily_plans[selectedDay]?.transportation || '정보 없음'}</Text>
                    <Text><strong>식사:</strong> {plan.daily_plans[selectedDay]?.meals?.join(', ') || '정보 없음'}</Text>
                  </VStack>
                  </VStack>
                </Box>
              </TabPanel>
              {/* 기본 정보 탭 */}
              <TabPanel px={isMobile ? 0 : 4}>
                <Heading size="md" mb={4} color="teal.600">추천 숙소</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                  {accommodations.length > 0 ? accommodations.map((acc: Accommodation, idx: number) => (
                    <Box key={idx} p={4} bg="white" borderRadius="xl" boxShadow="md">
                      <Text fontWeight="bold" fontSize="lg" color="teal.700">{acc.name || '이름 없음'}</Text>
                      <Text color="gray.700">📍 <b>주소:</b> {acc.address || '정보 없음'}</Text>
                      <Text color="gray.700">💰 <b>숙박비:</b> {(acc.price || 0).toLocaleString()}</Text>
                      <Text color="gray.700">🕒 <b>체크인:</b> {acc.check_in || '정보 없음'}</Text>
                      <Text color="gray.700">�� <b>체크아웃:</b> {acc.check_out || '정보 없음'}</Text>
                    </Box>
                  )) : <Text color="gray.500">추천 숙소 정보가 없습니다.</Text>}
                </SimpleGrid>
                <Heading size="md" mb={4} color="teal.600">추천 식당</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {restaurants.length > 0 ? restaurants.map((res: Spot, idx: number) => (
                    <Box key={idx} p={4} bg="white" borderRadius="xl" boxShadow="md">
                      <Text fontWeight="bold" fontSize="lg" color="teal.700">{res.name || '이름 없음'}</Text>
                      <Text color="gray.700">📍 <b>주소:</b> {res.address || '정보 없음'}</Text>
                      <Text color="gray.700">💰 <b>예상 비용:</b> {(res.price || 0).toLocaleString()}</Text>
                      <Text color="gray.700">⏰ <b>운영시간:</b> {res.open_time || '정보 없음'}</Text>
                      <Text color="gray.700">☎️ <b>전화번호:</b> {res.tel || '정보 없음'}</Text>
                    </Box>
                  )) : <Text color="gray.500">추천 식당 정보가 없습니다.</Text>}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* 지도 모달 */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Icon as={FaMap} color="teal.500" />
                <Text>{selectedDay + 1}일차 여행지 지도</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                {/* 여행지 목록 */}
                <Box>
                  <Heading size="sm" mb={3} color="teal.700">
                    {selectedDay + 1}일차 방문 예정지 ({getCurrentDaySpots().length}개)
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {getCurrentDaySpots().map((spot: Spot, idx: number) => (
                      <Box key={idx} p={3} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                        <HStack spacing={2}>
                          <Icon as={FaMapMarkerAlt} color="teal.500" />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="bold" fontSize="sm" color="teal.700">
                              {spot.name || '이름 없음'}
                            </Text>
                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                              {spot.address || '주소 정보 없음'}
                            </Text>
                            <Badge colorScheme="teal" variant="subtle" size="sm">
                              {spot.category || '기타'}
                            </Badge>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* 지도 영역 */}
                <KakaoMap 
                  spots={getCurrentDaySpots().map((spot: Spot) => ({
                    id: spot.id || Math.random(),
                    name: spot.name || '이름 없음',
                    address: spot.address || '주소 정보 없음',
                    category: spot.category || '기타',
                    time: spot.time,
                    tel: spot.tel,
                    homepage: spot.homepage,
                    price: spot.price
                  }))}
                  height="500px"
                />
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* 추천 장소 선택 모달 */}
        <Modal isOpen={recommendModalOpen} onClose={() => setRecommendModalOpen(false)} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Icon as={FaLightbulb} color="teal.500" />
                <Text>대안 장소 추천</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text color="gray.600" fontSize="sm">
                  아래 추천 장소 중 하나를 선택하여 현재 장소를 교체할 수 있습니다.
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {recommendedSpots.map((spot: Spot, idx: number) => (
                    <Box 
                      key={idx} 
                      p={4} 
                      bg="white" 
                      borderRadius="xl" 
                      boxShadow="md" 
                      border="2px" 
                      borderColor="gray.200"
                      cursor="pointer"
                      _hover={{ 
                        borderColor: "teal.300", 
                        boxShadow: "lg",
                        transform: "translateY(-2px)"
                      }}
                      transition="all 0.2s"
                      onClick={() => handleSelectRecommendedSpot(spot)}
                    >
                      <HStack align="flex-start" spacing={3}>
                        {spot.image_url && (
                          <Image 
                            src={spot.image_url} 
                            alt={spot.name} 
                            boxSize="60px" 
                            objectFit="cover" 
                            borderRadius="md" 
                          />
                        )}
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="bold" fontSize="md" color="teal.700">
                            {spot.name || '이름 없음'}
                          </Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {spot.description || '설명 없음'}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            📍 {spot.address || '주소 정보 없음'}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="teal" variant="subtle" size="sm">
                              {spot.category || '기타'}
                            </Badge>
                            {spot.price && (
                              <Badge colorScheme="green" variant="subtle" size="sm">
                                {(spot.price || 0).toLocaleString()}원
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
                
                {recommendedSpots.length === 0 && (
                  <Box p={8} textAlign="center" color="gray.500">
                    <Text>추천할 수 있는 대안 장소가 없습니다.</Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </div>
  );
} 