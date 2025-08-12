import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Image,
  Badge,
  useToast,
  Spinner,
  Flex,
  useBreakpointValue,
  Card,
  CardBody,
  CardHeader,
  Icon,
} from '@chakra-ui/react';
import { FaRobot, FaStar, FaMapMarkerAlt, FaHeart, FaLightbulb } from 'react-icons/fa';

interface AISpot {
  id: number;
  name: string;
  address: string;
  category: string;
  description: string;
  image_url: string;
  ai_score: number;
  reason: string;
  tags: string[];
}

export default function AIPage() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'trending', label: '트렌딩' },
    { value: 'hidden', label: '숨겨진 명소' },
    { value: 'seasonal', label: '시즌 추천' },
  ];

  // AI 추천 여행지 더미 데이터
  const aiSpots: AISpot[] = [
    {
      id: 1,
      name: '한강공원',
      address: '서울특별시 영등포구 여의도동',
      category: '관광지',
      description: 'AI가 추천하는 봄철 피크닉 명소',
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      ai_score: 9.2,
      reason: '봄철 벚꽃과 함께하는 완벽한 피크닉 장소',
      tags: ['봄', '피크닉', '자연', '가족'],
    },
    {
      id: 2,
      name: '북촌한옥마을',
      address: '서울특별시 종로구 계동',
      category: '관광지',
      description: '전통과 현대가 공존하는 아름다운 마을',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      ai_score: 8.9,
      reason: '한국의 전통미를 느낄 수 있는 최고의 장소',
      tags: ['전통', '문화', '사진', '역사'],
    },
    {
      id: 3,
      name: '남이섬',
      address: '강원도 춘천시 남산면 남이섬길 1',
      category: '관광지',
      description: '사계절 아름다운 자연 속 낭만의 섬',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      ai_score: 9.5,
      reason: '계절별로 다른 매력을 보여주는 완벽한 여행지',
      tags: ['자연', '로맨틱', '사계절', '힐링'],
    },
    {
      id: 4,
      name: '부산 감천문화마을',
      address: '부산광역시 사하구 감천동',
      category: '관광지',
      description: '부산의 산토리니, 다채로운 색채의 마을',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      ai_score: 8.7,
      reason: '독특한 건축물과 예술작품이 어우러진 특별한 곳',
      tags: ['예술', '색채', '문화', '인스타그램'],
    },
    {
      id: 5,
      name: '제주 올레길',
      address: '제주특별자치도 전역',
      category: '관광지',
      description: '제주의 아름다운 자연을 걸으며 느끼는 힐링',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      ai_score: 9.1,
      reason: '자연과 함께하는 건강한 여행의 정석',
      tags: ['트레킹', '자연', '건강', '제주'],
    },
    {
      id: 6,
      name: '경주 동궁과 월지',
      address: '경상북도 경주시 원화로 102',
      category: '관광지',
      description: '신라의 아름다운 궁궐과 연못',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      ai_score: 8.8,
      reason: '역사와 자연이 조화를 이룬 아름다운 장소',
      tags: ['역사', '문화', '야경', '경주'],
    },
  ];

  const handleGetRecommendation = () => {
    setLoading(true);
    setTimeout(() => {
      toast({
        title: 'AI 맞춤 추천 준비 중',
        description: '곧 더 정교한 AI 추천 시스템이 업데이트됩니다!',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }, 2000);
  };

  const filteredSpots = selectedCategory === 'all' 
    ? aiSpots 
    : aiSpots.filter(spot => spot.tags.includes(selectedCategory));

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* 헤더 섹션 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={6}>
          <VStack spacing={4}>
            <HStack>
              <Icon as={FaRobot} w={8} h={8} color="teal.500" />
              <Heading size="lg" color="teal.700">AI 추천</Heading>
            </HStack>
            <Text color="gray.600" textAlign="center">
              AI가 분석한 최신 트렌드와 개인 취향을 반영한 맞춤 여행지 추천
            </Text>
            
            <Button
              colorScheme="teal"
              size="lg"
              leftIcon={<FaLightbulb />}
              onClick={handleGetRecommendation}
              isLoading={loading}
            >
              나만의 AI 맞춤 추천 받기
            </Button>
          </VStack>
        </Box>

        {/* 카테고리 필터 */}
        <Box bg="white" borderRadius="xl" boxShadow="md" p={4}>
          <HStack spacing={4} justify="center" flexWrap="wrap">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'solid' : 'outline'}
                colorScheme="teal"
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* AI 추천 여행지 */}
        <Box>
          <Heading size="md" mb={6} color="teal.700">
            AI 추천 여행지 ({filteredSpots.length}개)
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredSpots.map((spot) => (
              <Box
                key={spot.id}
                bg="white"
                borderRadius="xl"
                boxShadow="md"
                overflow="hidden"
                _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                transition="all 0.2s"
              >
                <Box position="relative">
                  <Image
                    src={spot.image_url}
                    alt={spot.name}
                    w="100%"
                    h="200px"
                    objectFit="cover"
                  />
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="teal"
                    variant="solid"
                    borderRadius="full"
                    px={2}
                  >
                    AI {spot.ai_score}
                  </Badge>
                </Box>
                
                <Box p={4}>
                  <HStack justify="space-between" mb={2}>
                    <Heading size="md" color="teal.700" noOfLines={1}>
                      {spot.name}
                    </Heading>
                    <Badge colorScheme="teal" variant="subtle">
                      {spot.category}
                    </Badge>
                  </HStack>
                  
                  <Text color="gray.600" fontSize="sm" mb={3} noOfLines={2}>
                    {spot.description}
                  </Text>
                  
                  <VStack align="stretch" spacing={2} fontSize="sm" color="gray.700">
                    <HStack>
                      <FaMapMarkerAlt color="teal" />
                      <Text noOfLines={1}>{spot.address}</Text>
                    </HStack>
                    
                    <Box bg="teal.50" p={3} borderRadius="md">
                      <Text fontWeight="bold" color="teal.700" mb={1}>
                        🤖 AI 추천 이유
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {spot.reason}
                      </Text>
                    </Box>
                    
                    <HStack spacing={2} flexWrap="wrap">
                      {spot.tags.map((tag, idx) => (
                        <Badge key={idx} colorScheme="teal" variant="outline" size="sm">
                          #{tag}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* AI 특징 설명 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={6}>
          <Heading size="md" mb={4} color="teal.700">AI 추천 시스템의 특징</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <VStack spacing={3} textAlign="center">
              <Icon as={FaRobot} w={8} h={8} color="teal.400" />
              <Text fontWeight="bold" color="teal.700">실시간 분석</Text>
              <Text fontSize="sm" color="gray.600">
                최신 트렌드와 사용자 리뷰를 실시간으로 분석하여 추천
              </Text>
            </VStack>
            
            <VStack spacing={3} textAlign="center">
              <Icon as={FaHeart} w={8} h={8} color="teal.400" />
              <Text fontWeight="bold" color="teal.700">개인화 추천</Text>
              <Text fontSize="sm" color="gray.600">
                개인의 취향과 여행 히스토리를 기반으로 한 맞춤 추천
              </Text>
            </VStack>
            
            <VStack spacing={3} textAlign="center">
              <Icon as={FaStar} w={8} h={8} color="teal.400" />
              <Text fontWeight="bold" color="teal.700">높은 정확도</Text>
              <Text fontSize="sm" color="gray.600">
                AI 점수 시스템으로 신뢰할 수 있는 추천 결과 제공
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
} 