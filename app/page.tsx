"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PetOrkut() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeSection, setActiveSection] = useState("home")
  const [pets, setPets] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])

  const demo = (feature: string) => {
    alert(`PetOrkut v0.1 (protótipo) — "${feature}" ainda está em construção 💙🐾`)
  }

  // Dados mockados para demonstração
  useEffect(() => {
    // Pets mockados
    setPets([
      {
        id: 1,
        name: "Rex",
        breed: "Golden Retriever",
        age: 3,
        bio: "Amo correr no parque e brincar de buscar!",
        avatar: "/golden-retriever.png",
        owner: "Maria Silva",
        friends: 45,
      },
      {
        id: 2,
        name: "Mimi",
        breed: "Persa",
        age: 2,
        bio: "Gata elegante que adora dormir ao sol ☀️",
        avatar: "/fluffy-persian-cat.png",
        owner: "João Santos",
        friends: 32,
      },
      {
        id: 3,
        name: "Buddy",
        breed: "Beagle",
        age: 4,
        bio: "Sempre pronto para uma aventura!",
        avatar: "/beagle-dog.png",
        owner: "Ana Costa",
        friends: 28,
      },
    ])

    // Comunidades mockadas
    setCommunities([
      { id: 1, name: "Amantes de Cães", members: 1250, icon: "🐕" },
      { id: 2, name: "Gatos Fofos", members: 980, icon: "🐱" },
      { id: 3, name: "Pets Exóticos", members: 456, icon: "🦜" },
      { id: 4, name: "Adestramento", members: 723, icon: "🎾" },
      { id: 5, name: "Veterinários", members: 234, icon: "🏥" },
      { id: 6, name: "Pets Idosos", members: 567, icon: "👴" },
    ])

    // Depoimentos mockados
    setTestimonials([
      {
        id: 1,
        from: "Luna",
        to: "Rex",
        message: "Rex é o melhor amigo que um pet pode ter! Sempre brincalhão e carinhoso.",
        date: "2024-01-15",
      },
      {
        id: 2,
        from: "Bolt",
        to: "Mimi",
        message: "Mimi tem a elegância de uma verdadeira princesa felina!",
        date: "2024-01-10",
      },
    ])

    // Fotos mockadas
    setPhotos([
      { id: 1, url: "/dog-playing-park.jpg", caption: "Brincando no parque" },
      { id: 2, url: "/cat-sleeping-sun.jpg", caption: "Soneca ao sol" },
      { id: 3, url: "/pets-together.jpg", caption: "Amigos para sempre" },
      { id: 4, url: "/dog-beach.png", caption: "Dia na praia" },
      { id: 5, url: "/playful-cat-toy.png", caption: "Hora da brincadeira" },
      { id: 6, url: "/pet-birthday.jpg", caption: "Aniversário especial" },
    ])
  }, [])

  const Header = () => (
    <header className="orkut-gradient text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">🐾 PetOrkut</h1>
          <nav className="hidden md:flex gap-4">
            <Button
              variant={activeSection === "home" ? "secondary" : "ghost"}
              onClick={() => setActiveSection("home")}
              className="text-white hover:bg-white/20"
            >
              Início
            </Button>
            <Button
              variant={activeSection === "profiles" ? "secondary" : "ghost"}
              onClick={() => setActiveSection("profiles")}
              className="text-white hover:bg-white/20"
            >
              Perfis
            </Button>
            <Button
              variant={activeSection === "communities" ? "secondary" : "ghost"}
              onClick={() => setActiveSection("communities")}
              className="text-white hover:bg-white/20"
            >
              Comunidades
            </Button>
            <Button
              variant={activeSection === "photos" ? "secondary" : "ghost"}
              onClick={() => setActiveSection("photos")}
              className="text-white hover:bg-white/20"
            >
              Fotos
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar pets..."
            className="w-48 bg-white/20 border-white/30 text-white placeholder:text-white/70"
            onFocus={() => demo("Busca")}
          />
          <Button variant="secondary" size="sm" onClick={() => demo("Entrar")}>
            Entrar
          </Button>
        </div>
      </div>
    </header>
  )

  const PrototypeBanner = () => (
    <div className="container mx-auto px-4 mt-6">
      <Card className="pet-card-hover">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="font-semibold">Protótipo v0.1 — ideia registrada 💙🐾</p>
              <p className="text-sm text-muted-foreground">
                Ainda sem login e sem funções reais: é um mockup para guardar a visão do projeto.
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              DEMO
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const HomeSection = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-primary mb-4">Bem-vindo ao PetOrkut! 🐾</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A rede social onde seu pet pode fazer novos amigos, participar de comunidades e compartilhar momentos
          especiais. Reviva a nostalgia do Orkut com seus bichinhos!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="pet-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🌟 Destaques da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pets.slice(0, 2).map((pet) => (
                <div key={pet.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar>
                    <AvatarImage src={pet.avatar || "/placeholder.svg"} alt={pet.name} />
                    <AvatarFallback>{pet.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{pet.name}</h4>
                    <p className="text-sm text-muted-foreground">{pet.breed}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {pet.friends} amigos
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="pet-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">💬 Últimos Depoimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm mb-2">"{testimonial.message}"</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>De: {testimonial.from}</span>
                    <span>Para: {testimonial.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const ProfilesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Perfis dos Pets</h2>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => demo("Cadastrar Pet")}>
          Cadastrar Pet
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <Card key={pet.id} className="pet-card-hover">
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={pet.avatar || "/placeholder.svg"} alt={pet.name} />
                <AvatarFallback className="text-2xl">{pet.name[0]}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{pet.name}</CardTitle>
              <p className="text-muted-foreground">
                {pet.breed} • {pet.age} anos
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 text-center">{pet.bio}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Dono: {pet.owner}</span>
                <Badge variant="outline">{pet.friends} amigos</Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1" onClick={() => demo("Adicionar amigo")}>
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => demo("Enviar depoimento")}
                >
                  Depoimento
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const CommunitiesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Comunidades</h2>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => demo("Criar Comunidade")}>
          Criar Comunidade
        </Button>
      </div>

      <div className="community-grid">
        {communities.map((community) => (
          <Card key={community.id} className="pet-card-hover">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{community.icon}</div>
              <CardTitle className="text-lg">{community.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">{community.members.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mb-4">membros</p>
              <Button className="w-full" onClick={() => demo(`Participar: ${community.name}`)}>
                Participar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const PhotosSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Álbum de Fotos</h2>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => demo("Adicionar Foto")}>
          Adicionar Foto
        </Button>
      </div>

      <div className="photo-masonry">
        {photos.map((photo) => (
          <Card key={photo.id} className="mb-4 pet-card-hover break-inside-avoid">
            <CardContent className="p-0">
              <img src={photo.url || "/placeholder.svg"} alt={photo.caption} className="w-full h-auto rounded-t-lg" />
              <div className="p-3">
                <p className="text-sm font-medium">{photo.caption}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => demo("Curtir")}>
                    ❤️ Curtir
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => demo("Comentar")}>
                    💬 Comentar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case "profiles":
        return <ProfilesSection />
      case "communities":
        return <CommunitiesSection />
      case "photos":
        return <PhotosSection />
      default:
        return <HomeSection />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PrototypeBanner />
      <main className="container mx-auto px-4 py-8">{renderSection()}</main>

      <footer className="bg-card border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2024 PetOrkut - A rede social dos pets! 🐾</p>
          <p className="text-sm text-muted-foreground mt-2">Feito com ❤️ para nossos amigos de quatro patas</p>
        </div>
      </footer>
    </div>
  )
}

