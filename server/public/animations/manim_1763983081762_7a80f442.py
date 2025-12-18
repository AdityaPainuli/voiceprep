from manim import *

class PPOAnimation(Scene):
    def construct(self):
        # Agent
        agent = Circle(color=BLUE).shift(LEFT * 3)
        agent_label = Text("Agent").next_to(agent, DOWN)
        self.play(Create(agent), Write(agent_label))

        # Environment
        env = Rectangle(color=GREEN, width=4, height=2).shift(RIGHT * 3)
        env_label = Text("Environment").next_to(env, DOWN)
        self.play(Create(env), Write(env_label))

        # Action arrow
        action_arrow = Arrow(agent.get_right(), env.get_left(), buff=0.1, color=YELLOW)
        action_text = Text("Action").next_to(action_arrow, UP)
        self.play(Create(action_arrow), Write(action_text))

        # Reward arrow
        reward_arrow = Arrow(env.get_left(), agent.get_right(), buff=0.1, color=RED)
        reward_text = Text("Reward").next_to(reward_arrow, DOWN)
        self.play(Create(reward_arrow), Write(reward_text))

        # Policy update
        policy_update = Text("Policy Update", color=PURPLE).shift(DOWN * 2)
        self.play(Write(policy_update))

        # Loop indication
        loop_arrow = CurvedArrow(policy_update.get_left(), action_arrow.get_left(), color=WHITE)
        self.play(Create(loop_arrow))

        self.wait(2)