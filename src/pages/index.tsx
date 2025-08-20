import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useToast,
  Fade,
  SimpleGrid,
  Flex,
  useBreakpointValue,
  Input,
  Button,
  HStack,
  Icon,
  Image,
  Divider,
  Stack,
  Spinner,
} from '@chakra-ui/react';
import { FaStar, FaMapMarkerAlt, FaUserFriends, FaRobot, FaRegSmile, FaRegLightbulb } from 'react-icons/fa';
import { useRouter } from 'next/router';
import TravelPlanStepper, { TravelPlanFormData } from '../components/travel/TravelPlanStepper';

import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

const BG_IMAGE =
  'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80)';

const popularSpots = [
  {
    name: '제주도',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    desc: '한국 최고의 휴양지',
  },
  {
    name: '서울',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    desc: '트렌디한 도시 여행',
  },
  {
    name: '부산',
    image: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=600&q=80',
    desc: '바다와 먹거리의 천국',
  },
  {
    name: '경주',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    desc: '역사와 문화의 도시',
  },
];

const themes = [
  { icon: FaUserFriends, label: '가족 여행' },
  { icon: FaRegSmile, label: '커플 여행' },
  { icon: FaRobot, label: 'AI 맞춤 추천' },
  { icon: FaRegLightbulb, label: '이색 체험' },
];

const reviews = [
  {
    user: '여행러버123',
    text: 'AI가 짜준 일정 덕분에 완벽한 제주 여행을 했어요! 추천 코스와 맛집까지 최고였습니다.',
    rating: 5,
  },
  {
    user: '맛집탐방러',
    text: '부산에서 먹방 여행, AI가 추천해준 식당이 다 맛있었어요!',
    rating: 5,
  },
  {
    user: '혼행족',
    text: '혼자 떠난 경주 여행, AI가 동선까지 짜줘서 너무 편했어요.',
    rating: 4,
  },
];

const aiFeatures = [
  {
    icon: FaRobot,
    title: 'AI 맞춤 일정',
    description: '개인 취향과 여행 스타일에 맞는 최적의 일정을 자동으로 생성합니다.',
  },
  {
    icon: FaRegLightbulb,
    title: '스마트 추천',
    description: '실시간 데이터 분석을 통해 최고의 여행지와 맛집을 추천합니다.',
  },
  {
    icon: FaUserFriends,
    title: '그룹 최적화',
    description: '여행 인원과 구성에 맞는 최적의 코스와 숙소를 제안합니다.',
  },
];

export default function Home() {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('hero-section');

  // Intersection Observer를 사용하여 현재 섹션 감지
  useEffect(() => {
    const sections = ['hero-section', 'popular-section', 'theme-section', 'review-section', 'ai-section'];
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sections.includes(sectionId)) {
            setActiveSection(sectionId);
          }
        }
      });
    }, {
      threshold: 0.5, // 섹션이 50% 이상 보일 때 감지
      rootMargin: '-20% 0px -20% 0px' // 화면 중앙 부분만 감지
    });

    // 각 섹션을 관찰
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // 휠 이벤트로 스크롤 처리 (데스크톱에서만)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 휴대폰이나 태블릿에서는 기본 스크롤 허용
      if ('ontouchstart' in window || window.innerWidth <= 768) {
        return;
      }
      
      const sections = ['hero-section', 'popular-section', 'theme-section', 'review-section', 'ai-section'];
      const currentIndex = sections.indexOf(activeSection);
      
      // 스크롤 민감도 조절 (deltaY가 일정 값 이상일 때만 반응)
      if (Math.abs(e.deltaY) < 50) {
        return;
      }
      
      if (e.deltaY > 0 && currentIndex < sections.length - 1) {
        // 아래로 스크롤
        e.preventDefault();
        const nextSection = document.getElementById(sections[currentIndex + 1]);
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // 위로 스크롤
        e.preventDefault();
        const prevSection = document.getElementById(sections[currentIndex - 1]);
        if (prevSection) {
          prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    // 데스크톱에서만 휠 이벤트 추가
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [activeSection]);

  const handlePlanComplete = async (formData: TravelPlanFormData) => {
    if (!user) {
      toast({
        title: '로그인이 필요합니다',
        description: '여행 계획 생성을 위해 먼저 로그인해 주세요.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        destination: formData.sido + ' ' + formData.sigungu,
        companions: [],
        budget: formData.budget,
        start_date: formData.startDate,
        end_date: formData.endDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        interests: formData.interests,
        transport: formData.transport,
        style: formData.style,
      };
      const token = await user.getIdToken();
      const response = await fetch(apiUrl('/api/travel-plan'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        router.push({
          pathname: '/plan',
          query: { data: encodeURIComponent(JSON.stringify(result.data)) },
        });
      } else {
        throw new Error(result.message || '여행 계획 생성에 실패했습니다.');
      }
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '여행 계획 생성에 실패했습니다.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="gray.50"
      sx={{
        minH: '100vh',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        scrollPaddingTop: '0px',
        '&::-webkit-scrollbar': {
          width: '0px',
          background: 'transparent'
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent'
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'transparent'
        }
      }}
    >

      
      {/* 신호등 모양 네비게이션 메뉴 */}
      <Box
        position="fixed"
        right={8}
        top="50%"
        transform="translateY(-50%)"
        zIndex={20}
        display={{ base: 'none', md: 'block' }}
      >
        <VStack spacing={3}>
          {/* 선택폼 */}
          <Box
            w={3}
            h={3}
            borderRadius="full"
            bg={activeSection === 'hero-section' ? 'teal.400' : 'white'}
            cursor="pointer"
            _hover={{ bg: 'teal.300', transform: 'scale(1.2)' }}
            transition="all 0.2s ease"
            onClick={() => {
              const heroSection = document.getElementById('hero-section');
              if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
          
          {/* 인기 여행지 */}
          <Box
            w={3}
            h={3}
            borderRadius="full"
            bg={activeSection === 'popular-section' ? 'teal.400' : 'white'}
            cursor="pointer"
            _hover={{ bg: 'teal.300', transform: 'scale(1.2)' }}
            transition="all 0.2s ease"
            onClick={() => {
              const popularSection = document.getElementById('popular-section');
              if (popularSection) {
                popularSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
          
          {/* 테마별 추천 */}
          <Box
            w={3}
            h={3}
            borderRadius="full"
            bg={activeSection === 'theme-section' ? 'teal.400' : 'white'}
            cursor="pointer"
            _hover={{ bg: 'teal.300', transform: 'scale(1.2)' }}
            transition="all 0.2s ease"
            onClick={() => {
              const themeSection = document.getElementById('theme-section');
              if (themeSection) {
                themeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
          
          {/* 실제 이용자 후기 */}
          <Box
            w={3}
            h={3}
            borderRadius="full"
            bg={activeSection === 'review-section' ? 'teal.400' : 'white'}
            cursor="pointer"
            _hover={{ bg: 'teal.300', transform: 'scale(1.2)' }}
            transition="all 0.2s ease"
            onClick={() => {
              const reviewSection = document.getElementById('review-section');
              if (reviewSection) {
                reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
          
          {/* AI 여행 서비스의 특징 */}
          <Box
            w={3}
            h={3}
            borderRadius="full"
            bg={activeSection === 'ai-section' ? 'teal.400' : 'white'}
            cursor="pointer"
            _hover={{ bg: 'teal.300', transform: 'scale(1.2)' }}
            transition="all 0.2s ease"
            onClick={() => {
              const aiSection = document.getElementById('ai-section');
              if (aiSection) {
                aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
        </VStack>
      </Box>
      
      {/* Hero Section - 선택폼 */}
      <Box
        id="hero-section"
        bgImage={BG_IMAGE}
        bgSize="cover"
        bgPosition="center"
        bgAttachment="fixed"
        minH="100vh"
        position="relative"
        display="flex"
        alignItems="flex-start"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          w: '100%',
          h: '100%',
          bg: 'rgba(0,0,0,0.45)',
          zIndex: 1,
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={2} pt="80px">
          <VStack spacing={{ base: 6, md: 8 }} align="center">
            <Heading 
              color="white" 
              size={{ base: 'xl', md: '2xl', lg: '3xl' }} 
              textShadow="0 2px 16px rgba(0,0,0,0.3)"
              textAlign="center"
            >
              AI가 추천하는 나만의 여행 일정
            </Heading>


            <Box 
              w={{ base: '95%', md: '90%', lg: '100%' }} 
              maxW="100%"
            >
              {loading ? (
                <VStack py={{ base: 12, md: 16 }}>
                  <Spinner size={{ base: 'lg', md: 'xl' }} thickness="6px" color="teal.400" speed="0.8s" />
                  <Heading size={{ base: 'sm', md: 'md' }} color="teal.600" mt={4}>여행 계획 생성 중...</Heading>
                  <Text color="gray.100" fontSize={{ base: 'sm', md: 'md' }} textAlign="center">
                    AI가 맞춤 여행 일정을 만드는 중입니다. 잠시만 기다려 주세요!
                  </Text>
                </VStack>
              ) : (
                <TravelPlanStepper onComplete={handlePlanComplete} />
              )}
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* 인기 여행지 */}
      <Box 
        id="popular-section"
        minH="100vh" 
        bgImage="url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1500&q=80')"
        bgSize="cover"
        bgPosition="center"
        display="flex" 
        alignItems="center"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          w: '100%',
          h: '100%',
          bg: 'rgba(0,0,0,0.25)',
          zIndex: 0,
        }}
      >
        <Container maxW="container.lg" py={{ base: 16, md: 20, lg: 24 }}>
          <VStack spacing={{ base: 8, md: 10, lg: 12 }}>
          <VStack spacing={{ base: 3, md: 4 }} textAlign="center" position="relative" zIndex={1}>
            <Heading 
              size={{ base: 'xl', md: '2xl' }} 
              color="white" 
              fontWeight="bold"
              textShadow="0 2px 8px rgba(0,0,0,0.5)"
            >
              🌟 인기 여행지
            </Heading>
            <Text 
              color="white" 
              fontSize={{ base: 'md', md: 'lg' }} 
              maxW={{ base: '90%', md: '2xl' }}
              textAlign="center"
              textShadow="0 2px 8px rgba(0,0,0,0.5)"
            >
              많은 여행자들이 선택한 인기 여행지들을 둘러보세요
            </Text>
          </VStack>
          
          <SimpleGrid 
            columns={{ base: 1, sm: 2, md: 2, lg: 4 }} 
            spacing={{ base: 4, md: 6, lg: 6 }} 
            w="full"
          >
            {popularSpots.map((spot, idx) => (
              <Box 
                key={idx} 
                bg="white" 
                borderRadius="2xl" 
                boxShadow="0 10px 30px rgba(0,0,0,0.1)" 
                overflow="hidden" 
                cursor="pointer"
                onClick={() => router.push(`/search?destination=${encodeURIComponent(spot.name)}`)}
                _hover={{ 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
                  transform: 'translateY(-8px)',
                  '& .spot-image': {
                    transform: 'scale(1.1)'
                  }
                }} 
                transition="all 0.3s ease"
                position="relative"
              >
                <Box position="relative" overflow="hidden" h="200px">
                  <Image 
                    src={spot.image} 
                    alt={spot.name} 
                    w="100%" 
                    h="100%" 
                    objectFit="cover"
                    className="spot-image"
                    transition="transform 0.3s ease"
                  />
                  <Box 
                    position="absolute" 
                    top={0} 
                    left={0} 
                    right={0} 
                    bottom={0}
                    bg="linear-gradient(to-t, rgba(0,0,0,0.6), transparent)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.3s ease"
                  />
                  <Box 
                    position="absolute" 
                    bottom={4} 
                    right={4}
                    bg="teal.500" 
                    color="white" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.3s ease"
                  >
                    클릭하여 검색
                  </Box>
                </Box>
                <Box p={6}>
                  <Heading size="lg" mb={3} color="gray.800" fontWeight="bold">{spot.name}</Heading>
                  <Text color="gray.600" fontSize="md" lineHeight="1.6">{spot.desc}</Text>
                  <Button 
                    mt={4} 
                    colorScheme="teal" 
                    variant="outline" 
                    size="sm" 
                    w="full"
                    onClick={() => router.push(`/search?destination=${encodeURIComponent(spot.name)}`)}
                    _hover={{ bg: 'teal.500', color: 'white' }}
                    transition="all 0.2s"
                  >
                    여행지 보기 →
                  </Button>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
        </Container>
      </Box>

      {/* 테마별 추천 */}
      <Box 
        id="theme-section"
        minH="100vh" 
        bgImage="url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1500&q=80')"
        bgSize="cover"
        bgPosition="center"
        display="flex" 
        alignItems="center"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          w: '100%',
          h: '100%',
          bg: 'rgba(0,0,0,0.4)',
          zIndex: 0,
        }}
      >
        <Container maxW="container.lg" py={{ base: 16, md: 20, lg: 24 }}>
          <VStack spacing={{ base: 8, md: 10, lg: 12 }}>
          <VStack spacing={{ base: 3, md: 4 }} textAlign="center" position="relative" zIndex={1}>
            <Heading 
              size={{ base: 'xl', md: '2xl' }} 
              color="white" 
              fontWeight="bold"
              textShadow="0 2px 8px rgba(0,0,0,0.3)"
            >
              🎯 테마별 추천
            </Heading>
            <Text 
              color="white" 
              fontSize={{ base: 'md', md: 'lg' }} 
              maxW={{ base: '90%', md: '2xl' }}
              textAlign="center"
              textShadow="0 2px 8px rgba(0,0,0,0.3)"
            >
              당신의 여행 스타일에 맞는 테마를 선택해보세요
            </Text>
          </VStack>
          
          <SimpleGrid 
            columns={{ base: 2, md: 2, lg: 4 }} 
            spacing={{ base: 4, md: 6, lg: 6 }} 
            w="full"
          >
            {themes.map((theme, idx) => (
              <Box 
                key={idx} 
                bg="white" 
                borderRadius="2xl" 
                boxShadow="0 10px 30px rgba(0,0,0,0.1)" 
                p={8}
                textAlign="center"
                cursor="pointer"
                _hover={{ 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
                  transform: 'translateY(-8px)',
                  '& .theme-icon': {
                    transform: 'scale(1.1) rotate(5deg)'
                  }
                }} 
                transition="all 0.3s ease"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #38B2AC 0%, #3182CE 100%)',
                }}
              >
                <VStack spacing={4}>
                  <Box 
                    w={16} 
                    h={16} 
                    bgGradient="linear(to-br, teal.400, blue.400)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 8px 25px rgba(56, 178, 172, 0.3)"
                    className="theme-icon"
                    transition="transform 0.3s ease"
                  >
                    <Icon as={theme.icon} w={8} h={8} color="white" />
                  </Box>
                  <Text fontWeight="bold" fontSize="lg" color="gray.800">{theme.label}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
        </Container>
      </Box>

      {/* 실제 이용자 후기 */}
      <Box 
        id="review-section"
        minH="100vh" 
        bgImage="url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1500&q=80')"
        bgSize="cover"
        bgPosition="center"
        display="flex" 
        alignItems="center"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          w: '100%',
          h: '100%',
          bg: 'rgba(0,0,0,0.4)',
          zIndex: 0,
        }}
      >
        <Container maxW="container.lg" py={{ base: 16, md: 20, lg: 24 }}>
          <VStack spacing={{ base: 8, md: 10, lg: 12 }}>
          <VStack spacing={{ base: 3, md: 4 }} textAlign="center" position="relative" zIndex={1}>
            <Heading 
              size={{ base: 'xl', md: '2xl' }} 
              color="white" 
              fontWeight="bold"
              textShadow="0 2px 8px rgba(0,0,0,0.3)"
            >
              💬 실제 이용자 후기
            </Heading>
            <Text color="white" fontSize="lg" maxW="2xl" textShadow="0 2px 8px rgba(0,0,0,0.3)">
              Travell AI를 사용한 여행자들의 생생한 후기를 확인해보세요
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
            {reviews.map((review, idx) => (
              <Box 
                key={idx} 
                bg="white" 
                borderRadius="2xl" 
                boxShadow="0 10px 30px rgba(0,0,0,0.1)" 
                p={8}
                position="relative"
                overflow="hidden"
                _hover={{ 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
                  transform: 'translateY(-8px)',
                }} 
                transition="all 0.3s ease"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                }}
              >
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Box 
                        w={12} 
                        h={12} 
                        bgGradient="linear(to-br, teal.400, blue.400)"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontWeight="bold"
                        fontSize="lg"
                      >
                        {review.user.charAt(0)}
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color="gray.800" fontSize="lg">{review.user}</Text>
                        <HStack spacing={1}>
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Icon as={FaStar} key={i} color="yellow.400" w={4} h={4} />
                          ))}
                        </HStack>
                      </VStack>
                    </HStack>
                  </HStack>
                  
                  <Box 
                    bg="gray.50" 
                    p={4} 
                    borderRadius="xl" 
                    borderLeft="4px solid"
                    borderColor="teal.400"
                  >
                    <Text color="gray.700" fontSize="md" lineHeight="1.6" fontStyle="italic">
                      "{review.text}"
                    </Text>
                  </Box>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
        </Container>
      </Box>

      {/* AI 여행 서비스의 특징 */}
      <Box 
        id="ai-section"
        minH="100vh" 
        bgImage="url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1500&q=80')"
        bgSize="cover"
        bgPosition="center"
        display="flex" 
        alignItems="center"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          w: '100%',
          h: '100%',
          bg: 'rgba(0,0,0,0.4)',
          zIndex: 0,
        }}
      >
        <Container maxW="container.lg" py={{ base: 16, md: 20, lg: 24 }}>
          <VStack spacing={{ base: 8, md: 10, lg: 12 }}>
          <VStack spacing={{ base: 3, md: 4 }} textAlign="center" position="relative" zIndex={1}>
            <Heading 
              size={{ base: 'xl', md: '2xl' }} 
              color="white" 
              fontWeight="bold"
              textShadow="0 2px 8px rgba(0,0,0,0.3)"
            >
              🚀 AI 여행 서비스의 특징
            </Heading>
            <Text 
              color="white" 
              fontSize={{ base: 'md', md: 'lg' }} 
              maxW="2xl"
              textAlign="center"
              textShadow="0 2px 8px rgba(0,0,0,0.3)"
            >
              최첨단 AI 기술로 제공하는 맞춤형 여행 서비스
            </Text>
          </VStack>
          
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3 }} 
            spacing={{ base: 6, md: 8, lg: 8 }} 
            w="full"
          >
            {aiFeatures.map((feature, idx) => (
              <Box 
                key={idx} 
                bg="white" 
                borderRadius="2xl" 
                boxShadow="0 10px 30px rgba(0,0,0,0.1)" 
                p={{ base: 6, md: 8 }} 
                textAlign="center"
                _hover={{ 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
                  transform: 'translateY(-8px)',
                  '& .feature-icon': {
                    transform: 'scale(1.1) rotate(5deg)'
                  }
                }} 
                transition="all 0.3s ease"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #38B2AC 0%, #3182CE 100%)',
                }}
              >
                <VStack spacing={{ base: 4, md: 6 }}>
                  <Box 
                    w={{ base: 14, md: 16 }} 
                    h={{ base: 14, md: 16 }} 
                    bgGradient="linear(to-br, teal.400, blue.400)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 8px 25px rgba(56, 178, 172, 0.3)"
                    className="feature-icon"
                    transition="transform 0.3s ease"
                  >
                    <Icon as={feature.icon} w={{ base: 7, md: 8 }} h={{ base: 7, md: 8 }} color="white" />
                  </Box>
                  <VStack spacing={{ base: 2, md: 3 }}>
                    <Text 
                      fontWeight="bold" 
                      fontSize={{ base: 'lg', md: 'xl' }} 
                      color="gray.800"
                    >
                      {feature.title}
                    </Text>
                    <Text 
                      color="gray.600" 
                      fontSize={{ base: 'sm', md: 'md' }} 
                      textAlign="center"
                      lineHeight="1.6"
                    >
                      {feature.description}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
        </Container>
      </Box>

      {/* 푸터 - 맨 하단에 고정 */}
      <Box 
        as="footer" 
        bg="teal.700" 
        color="white" 
        py={{ base: 6, md: 8 }} 
        w="100%"

      >
        <Container maxW="container.lg">
          <Stack 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align="center" 
            spacing={{ base: 3, md: 4 }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
              Travell AI © {new Date().getFullYear()}
            </Text>
            <HStack 
              spacing={{ base: 3, md: 4 }} 
              flexWrap="wrap" 
              justify={{ base: 'center', md: 'flex-end' }}
            >
              <Text fontSize={{ base: 'sm', md: 'md' }}>문의: fnm2248fnm10@naver.com</Text>
              <Text fontSize={{ base: 'sm', md: 'md' }}>Instagram</Text>
              <Text fontSize={{ base: 'sm', md: 'md' }}>Facebook</Text>
            </HStack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
} 