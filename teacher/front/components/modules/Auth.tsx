"use client"

import { useLogin } from "@/hooks/api/useLogin"

const MAX_ID = "1";

export default function AuthModule() {
  // const [fullName, setFullName] = useState("")
  // const [password, setPassword] = useState("")
  // const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState("")
  // const { saveSession } = useSession()

  // const t = translations[language] || translations.en

  // const URL = "http://localhost:8081/api"

  useLogin(MAX_ID);
  return null;
  // return (
  //   <div className="min-h-screen flex items-center justify-center p-4">
  //     <Card className="w-full max-w-md">
  //       <CardHeader className="text-center">
  //         <div className="flex justify-center mb-4">
  //           <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
  //             <GraduationCap className="w-8 h-8 text-primary-foreground" />
  //           </div>
  //         </div>
  //         <CardTitle className="text-2xl font-bold">{t.welcome}</CardTitle>
  //         <CardDescription>{t.enterCredentials}</CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <form className="space-y-4">
  //           <div>
  //             <Input
  //               type="text"
  //               placeholder={t.fullNamePlaceholder}
  //               value={fullName}
  //               onChange={(e) => {
  //                 setFullName(e.target.value)
  //                 setError("")
  //               }}
  //               required
  //             />
  //           </div>
  //           <div>
  //             <Input
  //               type="password"
  //               placeholder={t.passwordPlaceholder}
  //               value={password}
  //               onChange={(e) => {
  //                 setPassword(e.target.value)
  //                 setError("")
  //               }}
  //               required
  //             />
  //             {error && <p className="text-destructive text-sm mt-2">{error}</p>}
  //           </div>
  //           <Button
  //             type="submit"
  //             className="w-full"
  //             disabled={isLoading || !fullName.trim() || !password.trim()}
  //           >
  //             {isLoading ? `${t.login}...` : t.login}
  //           </Button>
  //         </form>
  //       </CardContent>
  //     </Card>
  //   </div>
  // )
}
