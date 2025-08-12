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
import { FaMap, FaMapMarkerAlt, FaSync, FaLightbulb, FaEllipsisV, FaCalendar } from 'react-icons/fa';
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
  const [recommendedSpots, setRecommendedSpots] = useState<Spot[]>([]);
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
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Header />
      
      <Container maxW="container.lg" py={8} mt="60px">
        <Box p={4} bg="white" borderRadius="2xl" boxShadow="2xl" mb={8}>
          <Heading size="lg" mb={2} color="teal.700">{plan.destination} 여행 계획</Heading>
          <Text color="gray.600" mb={2}>총 {plan.total_days}일 · 총 예상 비용: {plan.total_cost.toLocaleString()}원</Text>
          {plan.recommendations && plan.recommendations.length > 0 && (
            <Box mt={2}>
              <Heading size="sm" mb={1} color="teal.500">추천 사항</Heading>
              <VStack align="stretch">
                {plan.recommendations.map((rec, idx) => (
                  <Text key={idx}>• {rec}</Text>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={4}>
          <Tabs colorScheme="teal" variant="enclosed" isFitted>
            <TabList mb={4}>
              <Tab fontWeight="bold">일정표</Tab>
              <Tab fontWeight="bold">기본 정보</Tab>
            </TabList>
            <TabPanels>
              {/* 일정표 탭 */}
              <TabPanel px={isMobile ? 0 : 4}>
                <HStack spacing={2} mb={6} flexWrap="wrap">
                  {plan.daily_plans.map((_, idx) => (
                    <Button
                      key={idx}
                      colorScheme={selectedDay === idx ? 'teal' : 'gray'}
                      variant={selectedDay === idx ? 'solid' : 'outline'}
                      borderRadius="full"
                      onClick={() => setSelectedDay(idx)}
                    >
                      {idx + 1}일차
                    </Button>
                  ))}
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    borderRadius="full"
                    leftIcon={<FaMap />}
                    onClick={handleShowMap}
                  >
                    지도 보기
                  </Button>
                </HStack>
                <Box p={isMobile ? 2 : 6} bg="gray.50" borderRadius="xl" boxShadow="md">
                  <Heading size="md" mb={4} color="teal.600">{selectedDay + 1}일차 일정</Heading>
                  <VStack align="stretch" spacing={4}>
                    {(() => {
                      const day = plan.daily_plans[selectedDay];
                      if (!day) {
                        return (
                          <Box p={4} bg="gray.100" borderRadius="xl" textAlign="center" color="gray.500">
                            오늘은 추천 일정이 없습니다. 다른 날짜를 선택해 보세요!
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
                          <Box p={4} bg="gray.100" borderRadius="xl" textAlign="center" color="gray.500">
                            오늘은 추천 일정이 없습니다. 다른 날짜를 선택해 보세요!
                          </Box>
                        );
                      }
                      const cards = [];
                      // 숙소 표시 (더 안전한 조건)
                      if (day.accommodation && (day.accommodation.name || day.accommodation.id)) {
                        cards.push(
                          <Box key="accommodation" p={4} bg="teal.100" borderRadius="xl" boxShadow="sm" mb={2}>
                            <HStack justify="space-between" align="flex-start" mb={2}>
                              <Text fontWeight="bold" fontSize="md" color="teal.700">🏨 숙소</Text>
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
                            <Text color="gray.700">�� <b>숙박비:</b> {(day.accommodation.price || 0).toLocaleString()}원</Text>
                            <Text color="gray.700">☎️ <b>전화번호:</b> {day.accommodation.tel || '정보 없음'}</Text>
                            <Text color="gray.700">🔗 <b>홈페이지:</b> {day.accommodation.homepage || '정보 없음'}</Text>
                          </Box>
                        );
                      } else {
                      }
                      cards.push(...spots.map((spot: Spot, spotIdx: number) => (
                        <Box key={spotIdx} p={4} bg="white" borderRadius="xl" boxShadow="sm" mb={2}>
                          <HStack align="flex-start" spacing={4}>
                            {spot.image_url && <Image src={spot.image_url} alt={spot.name} boxSize="80px" objectFit="cover" borderRadius="md" />}
                            <Box flex={1}>
                              <HStack justify="space-between" align="flex-start" mb={2}>
                                <Text fontWeight="bold" fontSize="lg" color="teal.700">{spot.name || '이름 없음'}</Text>
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
                              <Text color="gray.600" mb={1}>{spot.description || '설명 없음'}</Text>
                              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={1} fontSize="sm" color="gray.700">
                                <Text>🕒 <b>시간:</b> {spot.time || '정보 없음'}</Text>
                                <Text>📍 <b>주소:</b> {spot.address || '정보 없음'}</Text>
                                <Text>💡 <b>카테고리:</b> {spot.category || '정보 없음'}</Text>
                                <Text>⏰ <b>운영시간:</b> {spot.open_time || '정보 없음'}</Text>
                                <Text>🚫 <b>휴무일:</b> {spot.closed_days || '정보 없음'}</Text>
                                <Text>💰 <b>예상 비용:</b> {(spot.price || 0).toLocaleString()}원</Text>
                                <Text>☎️ <b>전화번호:</b> {spot.tel || '정보 없음'}</Text>
                                <Text>🔗 <b>홈페이지:</b> {spot.homepage || '정보 없음'}</Text>
                                <Text>🅿️ <b>주차:</b> {spot.parking || '정보 없음'}</Text>
                                <Text>🏢 <b>시설:</b> {spot.facilities || '정보 없음'}</Text>
                                <Text>🔖 <b>콘텐츠타입:</b> {spot.content_type || '정보 없음'}</Text>
                              </SimpleGrid>
                            </Box>
                          </HStack>
                        </Box>
                      )));
                      return cards;
                    })()}
                    <Text><strong>교통:</strong> {plan.daily_plans[selectedDay]?.transportation || '정보 없음'}</Text>
                    <Text><strong>식사:</strong> {plan.daily_plans[selectedDay]?.meals?.join(', ') || '정보 없음'}</Text>
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
                      <Text color="gray.700">💰 <b>숙박비:</b> {(acc.price || 0).toLocaleString()}원</Text>
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
                      <Text color="gray.700">💰 <b>예상 비용:</b> {(res.price || 0).toLocaleString()}원</Text>
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
    </Box>
  );
} 