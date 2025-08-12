import { useState } from 'react';
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
import Header from '../components/Header';
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

export default function Home() {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <Box
        bgImage={BG_IMAGE}
        bgSize="cover"
        bgPosition="center"
        py={isMobile ? 16 : 32}
        position="relative"
        mt="60px" // Header 높이만큼 여백 추가
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          w: '100%',
          h: '100%',
          bg: 'rgba(0,0,0,0.45)',
          zIndex: 0,
        }}
      >
        <Container maxW="container.lg" position="relative" zIndex={1}>
          <VStack spacing={8} align="center">
            <Heading color="white" size={isMobile ? 'xl' : '3xl'} textShadow="0 2px 16px rgba(0,0,0,0.3)">
              AI가 추천하는 나만의 여행 일정
            </Heading>
            <Text color="gray.100" fontSize={isMobile ? 'md' : 'xl'} textAlign="center">
              여행지, 날짜, 인원만 입력하면 AI가 완벽한 여행 코스를 제안해드려요!
            </Text>
            <Box w="100%" maxW="lg">
              {loading ? (
                <VStack py={16}>
                  <Spinner size="xl" thickness="6px" color="teal.400" speed="0.8s" />
                  <Heading size="md" color="teal.600" mt={4}>여행 계획 생성 중...</Heading>
                  <Text color="gray.100">AI가 맞춤 여행 일정을 만드는 중입니다. 잠시만 기다려 주세요!</Text>
                </VStack>
              ) : (
                <TravelPlanStepper onComplete={handlePlanComplete} />
              )}
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* 인기 여행지 */}
      <Container maxW="container.lg" py={isMobile ? 10 : 20}>
        <Heading size="lg" mb={8} color="teal.700" textAlign="center">
          인기 여행지
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          {popularSpots.map((spot, idx) => (
            <Box key={idx} bg="white" borderRadius="xl" boxShadow="md" overflow="hidden" _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.2s">
              <Image src={spot.image} alt={spot.name} w="100%" h="160px" objectFit="cover" />
              <Box p={4}>
                <Heading size="md" color="teal.600">{spot.name}</Heading>
                <Text color="gray.600">{spot.desc}</Text>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* 테마별 추천 */}
      <Container maxW="container.lg" py={isMobile ? 8 : 16}>
        <Heading size="lg" mb={8} color="teal.700" textAlign="center">
          테마별 추천
        </Heading>
        <HStack justify="center" spacing={8} flexWrap="wrap">
          {themes.map((theme, idx) => (
            <VStack key={idx} spacing={3} bg="white" borderRadius="xl" boxShadow="md" p={6} minW="120px">
              <Icon as={theme.icon} w={8} h={8} color="teal.400" />
              <Text fontWeight="bold" color="teal.700">{theme.label}</Text>
            </VStack>
          ))}
        </HStack>
      </Container>

      {/* 후기 섹션 */}
      <Container maxW="container.lg" py={isMobile ? 8 : 16}>
        <Heading size="lg" mb={8} color="teal.700" textAlign="center">
          실제 이용자 후기
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {reviews.map((review, idx) => (
            <Box key={idx} bg="white" borderRadius="xl" boxShadow="md" p={6}>
              <HStack mb={2}>
                <Icon as={FaUserFriends} color="teal.400" />
                <Text fontWeight="bold">{review.user}</Text>
              </HStack>
              <Text color="gray.700" mb={2}>
                "{review.text}"
              </Text>
              <HStack>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Icon as={FaStar} key={i} color="yellow.400" />
                ))}
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* 서비스 특징 */}
      <Container maxW="container.lg" py={isMobile ? 8 : 16}>
        <Heading size="lg" mb={8} color="teal.700" textAlign="center">
          AI 여행 서비스의 특징
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <VStack bg="white" borderRadius="xl" boxShadow="md" p={8} spacing={4}>
            <Icon as={FaRobot} w={10} h={10} color="teal.400" />
            <Text fontWeight="bold" fontSize="xl" color="teal.700">AI 맞춤 일정</Text>
            <Text color="gray.600" textAlign="center">여행지, 일정, 취향에 맞춘 AI 추천으로 나만의 여행을!</Text>
          </VStack>
          <VStack bg="white" borderRadius="xl" boxShadow="md" p={8} spacing={4}>
            <Icon as={FaMapMarkerAlt} w={10} h={10} color="teal.400" />
            <Text fontWeight="bold" fontSize="xl" color="teal.700">실시간 인기 여행지</Text>
            <Text color="gray.600" textAlign="center">최신 트렌드와 인기 여행지를 한눈에 확인!</Text>
          </VStack>
          <VStack bg="white" borderRadius="xl" boxShadow="md" p={8} spacing={4}>
            <Icon as={FaRegSmile} w={10} h={10} color="teal.400" />
            <Text fontWeight="bold" fontSize="xl" color="teal.700">간편한 사용</Text>
            <Text color="gray.600" textAlign="center">누구나 쉽게, 몇 번의 클릭만으로 여행 계획 완성!</Text>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* 푸터 */}
      <Box as="footer" bg="teal.700" color="white" py={8} mt={8}>
        <Container maxW="container.lg">
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" spacing={4}>
            <Text fontWeight="bold">Travell AI © {new Date().getFullYear()}</Text>
            <HStack spacing={4}>
              <Text>문의: fnm2248fnm10@naver.com</Text>
              <Text>Instagram</Text>
              <Text>Facebook</Text>
            </HStack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
} 