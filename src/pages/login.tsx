import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: '입력 오류',
        description: '이메일과 비밀번호를 모두 입력하세요.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '로그인 성공',
        description: '환영합니다!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: '로그인 실패',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={16}>
      <Box p={8} bg="white" borderRadius="xl" boxShadow="2xl">
        <Heading as="h2" size="lg" mb={8} textAlign="center" color="teal.600">
          로그인
        </Heading>
        <form onSubmit={handleLogin}>
          <VStack spacing={6}>
            <FormControl id="email" isRequired>
              <FormLabel>이메일</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>비밀번호</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </FormControl>
            <Button colorScheme="teal" type="submit" w="100%" isLoading={loading}>
              로그인
            </Button>
            <Text fontSize="sm" color="gray.600">
              계정이 없으신가요?{' '}
              <Link as={NextLink} href="/signup" color="teal.500" fontWeight="bold">
                회원가입
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Container>
  );
} 