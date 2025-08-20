import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  Avatar,
  HStack,
  Icon,
  SimpleGrid,
  Button,
  Divider,
} from '@chakra-ui/react';
import { FaUserCircle, FaStar, FaMapMarkerAlt, FaRobot } from 'react-icons/fa';

const dummyHistory = [
  {
    type: '여행지',
    icon: FaMapMarkerAlt,
    title: '제주도 2박 3일',
    date: '2024-05-01',
    desc: 'AI 추천 일정으로 제주도 여행을 다녀왔어요!'
  },
  {
    type: '리뷰',
    icon: FaStar,
    title: '부산 맛집 투어',
    date: '2024-04-10',
    desc: '부산에서 먹방 여행, AI가 추천해준 식당이 다 맛있었어요!'
  },
  {
    type: 'AI 추천',
    icon: FaRobot,
    title: '경주 역사 여행',
    date: '2024-03-20',
    desc: 'AI가 동선까지 짜줘서 너무 편했어요.'
  },
];

export default function MyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Container maxW="sm" py={16}>
        <VStack>
          <Spinner size="xl" />
          <Text>로딩 중...</Text>
        </VStack>
      </Container>
    );
  }

  if (!user) return null;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* 상단 프로필 Hero */}
      <Box bgGradient="linear(to-r, teal.400, teal.600)" py={24} textAlign="center" position="relative">
        <Avatar size="2xl" name={user.email || undefined} icon={<FaUserCircle fontSize="3rem" />} mx="auto" mb={4} />
        <Heading color="white" size="lg">{user.email}</Heading>
        <Text color="teal.100" fontSize="md">나의 여행 프로필</Text>
      </Box>

      <Container maxW="container.sm" mt={0}>
        <Box p={8} bg="white" borderRadius="2xl" boxShadow="3xl" mb={8}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Box>
              <Text fontWeight="bold" color="teal.700">이메일</Text>
              <Text>{user.email}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="teal.700">UID</Text>
              <Text>{user.uid}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="teal.700">가입일</Text>
              <Text>{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : '-'}</Text>
            </Box>
          </SimpleGrid>
          <Divider my={6} />
          <Button colorScheme="teal" variant="outline" w="100%" mb={2}>
            프로필 수정 (준비중)
          </Button>
          <Button colorScheme="teal" w="100%" mb={2}>
            비밀번호 변경 (준비중)
          </Button>
        </Box>

        {/* 최근 이용/리뷰/AI 추천 내역 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={6} mb={8}>
          <Heading size="md" mb={4} color="teal.600">최근 활동 내역</Heading>
          <VStack spacing={4} align="stretch">
            {dummyHistory.map((item, idx) => (
              <HStack key={idx} align="flex-start" spacing={4}>
                <Icon as={item.icon} w={8} h={8} color="teal.400" />
                <Box>
                  <Text fontWeight="bold" color="teal.700">{item.title}</Text>
                  <Text color="gray.600" fontSize="sm">{item.date} | {item.type}</Text>
                  <Text color="gray.700">{item.desc}</Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Container>
    </Box>
  );
} 