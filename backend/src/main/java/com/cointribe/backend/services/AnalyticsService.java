package com.cointribe.backend.services;

import com.cointribe.backend.models.Achievement;
import com.cointribe.backend.models.Challenge;
import com.cointribe.backend.models.User;
import com.cointribe.backend.models.UserAchievement;
import com.cointribe.backend.models.UserChallenge;
import com.cointribe.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final PostRepository postRepository;

    @Autowired
    public AnalyticsService(UserRepository userRepository,
                            ChallengeRepository challengeRepository,
                            UserChallengeRepository userChallengeRepository,
                            AchievementRepository achievementRepository,
                            UserAchievementRepository userAchievementRepository,
                            PostRepository postRepository) {
        this.userRepository = userRepository;
        this.challengeRepository = challengeRepository;
        this.userChallengeRepository = userChallengeRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.postRepository = postRepository;
    }

    public Map<String, Object> getAnalyticsSummary() {
        List<User> users = userRepository.findByActivoTrue();
        int totalUsuarios = users.size();

        double ahorroTotal = users.stream().mapToDouble(u -> u.getAhorro() != null ? u.getAhorro() : 0.0).sum();
        double ahorroPromedio = totalUsuarios > 0 ? ahorroTotal / totalUsuarios : 0.0;
        double metaPromedio = totalUsuarios > 0 ? users.stream().mapToDouble(u -> u.getMeta() != null ? u.getMeta() : 0.0).average().orElse(0.0) : 0.0;

        double pctMetaPromedio = totalUsuarios > 0
                ? users.stream()
                .mapToDouble(u -> (u.getMeta() != null && u.getMeta() > 0) ? (u.getAhorro() / u.getMeta()) * 100 : 0.0)
                .average().orElse(0.0)
                : 0.0;

        long mitadMeta = users.stream()
                .filter(u -> u.getMeta() != null && u.getMeta() > 0 && u.getAhorro() >= (u.getMeta() * 0.5))
                .count();

        long metaCumplida = users.stream()
                .filter(u -> u.getMeta() != null && u.getMeta() > 0 && u.getAhorro() >= u.getMeta())
                .count();

        int totalLecciones = users.stream().mapToInt(u -> u.getLeccionesCompletadas() != null ? u.getLeccionesCompletadas() : 0).sum();
        int totalRetos = users.stream().mapToInt(u -> u.getRetosAceptados() != null ? u.getRetosAceptados() : 0).sum();
        long totalPosts = postRepository.count();

        // 1. Distribución por Nivel
        Map<Integer, Long> conteoNiveles = users.stream()
                .collect(Collectors.groupingBy(u -> u.getNivel() != null ? u.getNivel() : 1, Collectors.counting()));

        List<Map<String, Object>> distribucionNiveles = new ArrayList<>();
        for (int niv = 1; niv <= 5; niv++) {
            long count = conteoNiveles.getOrDefault(niv, 0L);
            double pct = totalUsuarios > 0 ? (count * 100.0) / totalUsuarios : 0.0;
            Map<String, Object> item = new HashMap<>();
            item.put("nivel", niv);
            item.put("cantidad", count);
            item.put("porcentaje", Math.round(pct * 10.0) / 10.0);
            distribucionNiveles.add(item);
        }

        // 2. Distribución de ahorro en rangos
        long r1 = users.stream().filter(u -> u.getAhorro() < 100000).count();
        long r2 = users.stream().filter(u -> u.getAhorro() >= 100000 && u.getAhorro() < 300000).count();
        long r3 = users.stream().filter(u -> u.getAhorro() >= 300000 && u.getAhorro() < 500000).count();
        long r4 = users.stream().filter(u -> u.getAhorro() >= 500000 && u.getAhorro() < 1000000).count();
        long r5 = users.stream().filter(u -> u.getAhorro() >= 1000000).count();

        List<Map<String, Object>> distribucionAhorro = List.of(
                Map.of("rango", "< $100k", "cantidad", r1, "porcentaje", Math.round((r1 * 100.0 / totalUsuarios) * 10.0) / 10.0),
                Map.of("rango", "$100k - $300k", "cantidad", r2, "porcentaje", Math.round((r2 * 100.0 / totalUsuarios) * 10.0) / 10.0),
                Map.of("rango", "$300k - $500k", "cantidad", r3, "porcentaje", Math.round((r3 * 100.0 / totalUsuarios) * 10.0) / 10.0),
                Map.of("rango", "$500k - $1M", "cantidad", r4, "porcentaje", Math.round((r4 * 100.0 / totalUsuarios) * 10.0) / 10.0),
                Map.of("rango", "> $1M", "cantidad", r5, "porcentaje", Math.round((r5 * 100.0 / totalUsuarios) * 10.0) / 10.0)
        );

        // 3. Top 10 Ahorradores
        List<Map<String, Object>> topAhorradores = users.stream()
                .sorted(Comparator.comparingDouble((User u) -> u.getAhorro() != null ? u.getAhorro() : 0.0).reversed())
                .limit(10)
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("nombre", u.getNombre());
                    map.put("nivel", u.getNivel());
                    map.put("ahorro", u.getAhorro());
                    map.put("meta", u.getMeta());
                    double pct = (u.getMeta() != null && u.getMeta() > 0) ? (u.getAhorro() / u.getMeta()) * 100 : 0.0;
                    map.put("pctMeta", Math.round(pct * 10.0) / 10.0);
                    return map;
                })
                .collect(Collectors.toList());

        // 4. Retos populares
        List<Challenge> challenges = challengeRepository.findAll();
        List<UserChallenge> userChallenges = userChallengeRepository.findAll();
        Map<Long, Long> partMap = userChallenges.stream()
                .collect(Collectors.groupingBy(uc -> uc.getChallenge().getId(), Collectors.counting()));
        Map<Long, Long> compMap = userChallenges.stream()
                .filter(uc -> Boolean.TRUE.equals(uc.getCompletado()))
                .collect(Collectors.groupingBy(uc -> uc.getChallenge().getId(), Collectors.counting()));

        List<Map<String, Object>> retosPopulares = challenges.stream()
                .map(ch -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("titulo", ch.getTitulo());
                    map.put("metaAhorro", ch.getMetaAhorro());
                    map.put("duracionDias", ch.getDuracionDias());
                    map.put("participantes", partMap.getOrDefault(ch.getId(), 0L));
                    map.put("completados", compMap.getOrDefault(ch.getId(), 0L));
                    return map;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("participantes"), (Long) a.get("participantes")))
                .collect(Collectors.toList());

        // 5. Logros populares
        List<Achievement> achievements = achievementRepository.findAll();
        List<UserAchievement> userAchievements = userAchievementRepository.findAll();
        Map<Long, Long> achCountMap = userAchievements.stream()
                .collect(Collectors.groupingBy(ua -> ua.getAchievement().getId(), Collectors.counting()));

        List<Map<String, Object>> logrosPopulares = achievements.stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("nombre", a.getNombre());
                    map.put("icono", a.getIcono());
                    map.put("codigo", a.getCodigo());
                    long c = achCountMap.getOrDefault(a.getId(), 0L);
                    map.put("desbloqueos", c);
                    map.put("porcentaje", totalUsuarios > 0 ? Math.round((c * 100.0 / totalUsuarios) * 10.0) / 10.0 : 0.0);
                    return map;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("desbloqueos"), (Long) a.get("desbloqueos")))
                .collect(Collectors.toList());

        // Ensamblado final
        Map<String, Object> summary = new HashMap<>();
        summary.put("kpis", Map.of(
                "totalUsuarios", totalUsuarios,
                "ahorroTotalTribu", Math.round(ahorroTotal),
                "ahorroPromedio", Math.round(ahorroPromedio),
                "metaPromedio", Math.round(metaPromedio),
                "pctMetaPromedio", Math.round(pctMetaPromedio * 10.0) / 10.0,
                "usuariosMitadMeta", mitadMeta,
                "usuariosMetaCumplida", metaCumplida,
                "totalLecciones", totalLecciones,
                "totalRetos", totalRetos,
                "totalPosts", totalPosts
        ));
        summary.put("distribucionNiveles", distribucionNiveles);
        summary.put("distribucionAhorro", distribucionAhorro);
        summary.put("topAhorradores", topAhorradores);
        summary.put("retosPopulares", retosPopulares);
        summary.put("logrosPopulares", logrosPopulares);

        return summary;
    }
}

